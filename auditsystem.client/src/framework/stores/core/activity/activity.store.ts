/**
 * Core store: Отслеживание активности пользователя
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logger } from '@/core/services/logger/logger.service';
import type { ActivityEvent, InactivityConfig } from './activity.types';

export const useActivityStore = defineStore('activity', () => {
  // State
  const lastActivity = ref<number>(Date.now());
  const sessionStart = ref<number>(Date.now());
  const activityEvents = ref<ActivityEvent[]>([]);
  const config = ref<InactivityConfig>({
    warningThreshold: 4 * 60 * 1000,    // 4 минуты
    logoutThreshold: 5 * 60 * 1000,     // 5 минут
    checkInterval: 30 * 1000           // 30 секунд
  });

  // Private state
  let warningShown = false;
  let activityListeners: (() => void)[] = [];
  let checkInterval: NodeJS.Timeout | null = null;

  // Getters
  const timeSinceLastActivity = computed(() => Date.now() - lastActivity.value);

  const isInactive = computed(() =>
    timeSinceLastActivity.value > config.value.warningThreshold
  );

  const shouldLogout = computed(() =>
    timeSinceLastActivity.value > config.value.logoutThreshold
  );

  const timeToWarning = computed(() =>
    Math.max(0, config.value.warningThreshold - timeSinceLastActivity.value)
  );

  const timeToLogout = computed(() =>
    Math.max(0, config.value.logoutThreshold - timeSinceLastActivity.value)
  );

  const sessionDuration = computed(() => Date.now() - sessionStart.value);

  // Actions
  const recordActivityEvent = (type: string, details?: Record<string, unknown>) => {
    const event: ActivityEvent = {
      type,
      timestamp: Date.now(),
      details
    };

    activityEvents.value.push(event);

    // Ограничиваем размер
    if (activityEvents.value.length > 1000) {
      activityEvents.value = activityEvents.value.slice(-500);
    }
  };

  const initialize = () => {
    setupActivityListeners();
    startInactivityCheck();

    recordActivityEvent('session_start', { sessionStart: new Date(sessionStart.value) });
    logger.info('Activity store initialized');
  };

  const updateLastActivity = (eventType?: string, details?: Record<string, unknown>) => {
    const previousActivity = lastActivity.value;
    lastActivity.value = Date.now();

    if (eventType) {
      recordActivityEvent(eventType, details);
    }

    // Сбрасываем предупреждение если пользователь снова активен
    if (warningShown && timeSinceLastActivity.value < config.value.warningThreshold) {
      warningShown = false;
      logger.debug('User became active again, warning cleared');
    }

    logger.debug('Activity updated', {
      eventType: eventType || 'manual',
      timeSincePrevious: lastActivity.value - previousActivity
    });
  };

  const resetInactivityTimer = () => {
    updateLastActivity('timer_reset');
    warningShown = false;
    logger.info('Inactivity timer reset');
  };

  const updateConfig = (newConfig: Partial<InactivityConfig>) => {
    const oldConfig = { ...config.value };
    config.value = { ...config.value, ...newConfig };

    // Перезапускаем проверку с новым интервалом
    if (checkInterval) {
      clearInterval(checkInterval);
      startInactivityCheck();
    }

    logger.info('Activity config updated', {
      old: oldConfig,
      new: config.value
    });
  };

  const resetSession = () => {
    const oldDuration = sessionDuration.value;

    sessionStart.value = Date.now();
    lastActivity.value = Date.now();
    activityEvents.value = [];
    warningShown = false;

    logger.info('Session reset', {
      oldDuration,
      newStart: new Date(sessionStart.value)
    });
  };

  // Helper methods
  const setupActivityListeners = () => {
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll',
      'touchstart', 'touchmove', 'click', 'dblclick',
      'input', 'change', 'focus', 'blur'
    ];

    const throttledUpdate = createThrottledUpdate();

    events.forEach(event => {
      const handler = () => throttledUpdate(event);
      document.addEventListener(event, handler, { passive: true });
      activityListeners.push(() => document.removeEventListener(event, handler));
    });

    // Слушатель видимости страницы
    const visibilityHandler = () => {
      if (!document.hidden) {
        updateLastActivity('visibility_change', { visible: true });
      } else {
        recordActivityEvent('visibility_change', { visible: false });
      }
    };

    document.addEventListener('visibilitychange', visibilityHandler);
    activityListeners.push(() => document.removeEventListener('visibilitychange', visibilityHandler));

    logger.debug('Activity listeners setup', { eventCount: events.length });
  };

  const createThrottledUpdate = () => {
    let lastCall = 0;
    const throttleDelay = 1000; // 1 секунда

    return (eventType: string) => {
      const now = Date.now();
      if (now - lastCall >= throttleDelay) {
        updateLastActivity(eventType);
        lastCall = now;
      }
    };
  };

  const startInactivityCheck = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
    }

    checkInterval = setInterval(() => {
      const inactiveTime = timeSinceLastActivity.value;

      // Показываем предупреждение
      if (inactiveTime > config.value.warningThreshold && !warningShown) {
        warningShown = true;
        logger.warn('User inactive', {
          inactiveTime,
          timeToLogout: timeToLogout.value
        });
      }

      // Критическая неактивность
      if (shouldLogout.value) {
        logger.error('Critical inactivity - should logout', {
          inactiveTime,
          threshold: config.value.logoutThreshold
        });
      }
    }, config.value.checkInterval);
  };

  const cleanup = () => {
    // Удаляем слушатели событий
    activityListeners.forEach(cleanup => cleanup());
    activityListeners = [];

    // Останавливаем интервал
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }

    logger.info('Activity store cleaned up');
  };

  // Инициализация при создании
  initialize();

  return {
    // State
    lastActivity: computed(() => lastActivity.value),
    sessionStart: computed(() => sessionStart.value),
    config: computed(() => config.value),
    activityEvents: computed(() => activityEvents.value),

    // Getters
    timeSinceLastActivity,
    isInactive,
    shouldLogout,
    timeToWarning,
    timeToLogout,
    sessionDuration,

    // Actions
    recordActivityEvent,
    updateLastActivity,
    resetInactivityTimer,
    updateConfig,
    resetSession,
    cleanup
  };
});
