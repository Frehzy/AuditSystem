// framework/stores/activity.store.ts
import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import { logger } from '@/core/utils/logger';
import type { InactivityConfig, ActivityEvent } from './types/activity.types';

/**
 * Стор для отслеживания активности пользователя
 */
export const useActivityStore = defineStore('activity', () => {
  // ==================== КОНФИГУРАЦИЯ ====================
  const defaultConfig: InactivityConfig = {
    warningThreshold: 4 * 60 * 1000,    // 4 минуты до предупреждения
    logoutThreshold: 5 * 60 * 1000,     // 5 минут до выхода
    checkInterval: 30 * 1000            // Проверка каждые 30 секунд
  };

  // ==================== СОСТОЯНИЕ ====================
  const lastActivity = ref(Date.now());
  const sessionStart = ref(Date.now());
  const activityEvents = ref<ActivityEvent[]>([]);
  const config = ref<InactivityConfig>(defaultConfig);

  let cleanupListener: (() => void) | null = null;
  let inactivityTimer: number | null = null;
  let warningShown = false;

  // ==================== КОМПЬЮТЕД СВОЙСТВА ====================
  /** Время с последней активности */
  const timeSinceLastActivity = computed(() => Date.now() - lastActivity.value);

  /** Неактивен ли пользователь (превышен порог предупреждения) */
  const isInactive = computed(() => timeSinceLastActivity.value > config.value.warningThreshold);

  /** Пора ли разлогиниться (превышен порог выхода) */
  const shouldLogout = computed(() => timeSinceLastActivity.value > config.value.logoutThreshold);

  /** Оставшееся время до предупреждения */
  const timeToWarning = computed(() =>
    Math.max(0, config.value.warningThreshold - timeSinceLastActivity.value)
  );

  /** Оставшееся время до выхода */
  const timeToLogout = computed(() =>
    Math.max(0, config.value.logoutThreshold - timeSinceLastActivity.value)
  );

  /** Длительность текущей сессии */
  const sessionDuration = computed(() => Date.now() - sessionStart.value);

  /** Статистика активности */
  const activityStats = computed(() => {
    const events = activityEvents.value;
    const eventTypes = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: events.length,
      eventTypes,
      lastEvent: events[events.length - 1],
      sessionStart: new Date(sessionStart.value),
      sessionDuration: sessionDuration.value
    };
  });

  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================
  /**
   * Оптимизация частых событий (троттлинг)
   */
  const createThrottledUpdate = () => {
    let lastCall = 0;
    const throttleDelay = 1000; // 1 секунда

    return (eventType: string, details?: Record<string, unknown>) => {
      const now = Date.now();
      if (now - lastCall >= throttleDelay) {
        updateLastActivity(eventType, details);
        lastCall = now;
      }
    };
  };

  /**
   * Регистрация события активности
   * @param type - Тип события
   * @param details - Детали события
   */
  const recordActivityEvent = (type: string, details?: Record<string, unknown>) => {
    const event: ActivityEvent = {
      type,
      timestamp: Date.now(),
      details
    };

    activityEvents.value.push(event);

    // Ограничиваем размер массива событий
    if (activityEvents.value.length > 1000) {
      activityEvents.value = activityEvents.value.slice(-500);
      logger.debug('История событий активности урезана', {
        remaining: activityEvents.value.length
      });
    }

    return event;
  };

  /**
   * Проверка неактивности
   */
  const checkInactivity = () => {
    const timeInactive = timeSinceLastActivity.value;

    // Показываем предупреждение при приближении к порогу
    if (timeInactive > config.value.warningThreshold && !warningShown) {
      warningShown = true;
      logger.warn('Пользователь неактивен', {
        timeInactive,
        timeToLogout: timeToLogout.value,
        warningThreshold: config.value.warningThreshold
      });
    }

    // Сбрасываем предупреждение при активности
    if (timeInactive < config.value.warningThreshold && warningShown) {
      warningShown = false;
      logger.debug('Пользователь снова активен, предупреждение сброшено');
    }

    // Логируем критическую неактивность
    if (shouldLogout.value) {
      logger.warn('Критическая неактивность пользователя', {
        timeInactive,
        logoutThreshold: config.value.logoutThreshold
      });
    }
  };

  // ==================== ОСНОВНЫЕ ДЕЙСТВИЯ ====================
  /**
   * Обновление времени последней активности
   * @param eventType - Тип события
   * @param details - Детали события
   */
  const updateLastActivity = (eventType?: string, details?: Record<string, unknown>) => {
    const previousActivity = lastActivity.value;
    lastActivity.value = Date.now();

    if (eventType) {
      recordActivityEvent(eventType, details);
    }

    logger.debug('Активность обновлена', {
      eventType: eventType || 'manual',
      timeSincePrevious: lastActivity.value - previousActivity,
      totalInactiveTime: timeSinceLastActivity.value
    });
  };

  /**
   * Сброс таймера неактивности
   */
  const resetInactivityTimer = () => {
    updateLastActivity('reset-timer');
    warningShown = false;
    logger.info('Таймер неактивности сброшен');
  };

  /**
   * Настройка слушателей активности
   */
  const setupActivityListeners = () => {
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress',
      'scroll', 'touchstart', 'touchmove',
      'click', 'dblclick', 'input', 'change'
    ];

    const throttledUpdate = createThrottledUpdate();

    activityEvents.forEach(event => {
      document.addEventListener(event, () => throttledUpdate(event), { passive: true });
    });

    // Отслеживаем изменение видимости страницы
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateLastActivity('visibility-change', { visible: true });
      } else {
        recordActivityEvent('visibility-change', { visible: false });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Запускаем периодическую проверку неактивности
    if (inactivityTimer) {
      clearInterval(inactivityTimer);
    }

    inactivityTimer = window.setInterval(() => {
      checkInactivity();
    }, config.value.checkInterval);

    logger.info('Слушатели активности инициализированы', {
      eventCount: activityEvents.length,
      checkInterval: config.value.checkInterval
    });

    // Возвращаем функцию для очистки
    cleanupListener = () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, () => throttledUpdate(event));
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (inactivityTimer) {
        clearInterval(inactivityTimer);
        inactivityTimer = null;
      }

      logger.debug('Слушатели активности очищены');
    };
  };

  /**
   * Очистка слушателей активности
   */
  const cleanupActivityListeners = () => {
    if (cleanupListener) {
      cleanupListener();
      cleanupListener = null;
    }
  };

  /**
   * Обновление конфигурации
   * @param newConfig - Новая конфигурация
   */
  const updateConfig = (newConfig: Partial<InactivityConfig>) => {
    const oldConfig = { ...config.value };
    config.value = { ...config.value, ...newConfig };

    logger.info('Конфигурация активности обновлена', {
      old: oldConfig,
      new: config.value
    });

    // Перезапускаем слушатели с новой конфигурацией
    cleanupActivityListeners();
    setupActivityListeners();
  };

  /**
   * Получение отчета об активности
   */
  const getActivityReport = () => ({
    sessionStart: new Date(sessionStart.value),
    lastActivity: new Date(lastActivity.value),
    timeSinceLastActivity: timeSinceLastActivity.value,
    isInactive: isInactive.value,
    shouldLogout: shouldLogout.value,
    timeToWarning: timeToWarning.value,
    timeToLogout: timeToLogout.value,
    sessionDuration: sessionDuration.value,
    activityStats: activityStats.value,
    config: config.value
  });

  /**
   * Сброс сессии
   */
  const resetSession = () => {
    const oldSessionDuration = sessionDuration.value;

    sessionStart.value = Date.now();
    lastActivity.value = Date.now();
    activityEvents.value = [];
    warningShown = false;

    logger.info('Сессия активности сброшена', {
      oldSessionDuration,
      newSessionStart: new Date(sessionStart.value)
    });
  };

  // Автоматическая инициализация
  setupActivityListeners();
  updateLastActivity('session-start', { sessionStart: new Date(sessionStart.value) });

  // Очистка при размонтировании
  onUnmounted(() => {
    cleanupActivityListeners();
    logger.info('Стор активности размонтирован');
  });

  return {
    // ==================== СОСТОЯНИЕ ====================
    lastActivity: computed(() => lastActivity.value),
    sessionStart: computed(() => sessionStart.value),
    config: computed(() => config.value),

    // ==================== КОМПЬЮТЕД СВОЙСТВА ====================
    timeSinceLastActivity,
    isInactive,
    shouldLogout,
    timeToWarning,
    timeToLogout,
    sessionDuration,
    activityStats,

    // ==================== ДЕЙСТВИЯ ====================
    updateLastActivity,
    recordActivityEvent,
    resetInactivityTimer,
    setupActivityListeners,
    cleanupActivityListeners,
    updateConfig,
    getActivityReport,
    resetSession
  };
});
