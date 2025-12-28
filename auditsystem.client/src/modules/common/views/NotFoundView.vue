<template>
  <div class="not-found-view" :class="{ 'theme-dark': isDarkTheme, 'theme-light': isLightTheme }">
    <!-- Основной контейнер -->
    <div class="not-found-container">
      <!-- Шапка с логотипом и навигацией -->
      <div class="not-found-header">
        <div class="header-logo">
          <AlertTriangleIcon class="logo-icon" />
          <div class="logo-text">
            <span class="logo-primary">{{ appName }}</span>
            <span class="logo-secondary">System</span>
          </div>
        </div>
        <div class="header-actions">
          <BaseButton v-if="canGoBack"
                      variant="ghost"
                      size="sm"
                      @click="goBack"
                      class="back-button">
            <div class="button-content">
              <ArrowLeftIcon class="button-icon" />
              <span>Назад</span>
            </div>
          </BaseButton>
          <BaseButton variant="ghost"
                      size="sm"
                      @click="toggleTheme"
                      class="theme-button"
                      :title="isDarkTheme ? 'Переключить на светлую тему' : 'Переключить на темную тему'">
            <component :is="themeIcon" class="theme-icon" />
          </BaseButton>
        </div>
      </div>

      <!-- Основной контент -->
      <div class="not-found-content">
        <!-- Блок с ошибкой 404 -->
        <div class="error-block">
          <div class="error-code">
            <span class="digit">4</span>
            <div class="error-icon-wrapper">
              <SearchIcon class="error-icon" />
            </div>
            <span class="digit">4</span>
          </div>

          <div class="error-info">
            <h1 class="error-title">Страница не найдена</h1>
            <p class="error-description">
              Мы не смогли найти
              <span class="path-highlight">{{ currentPath }}</span>
            </p>
          </div>

          <!-- Основная кнопка действия -->
          <div class="primary-action">
            <BaseButton variant="primary"
                        size="lg"
                        @click="goToHome"
                        class="home-button">
              <div class="button-content">
                <HomeIcon class="button-icon-lg" />
                <span>На главную</span>
              </div>
            </BaseButton>
          </div>
        </div>

        <!-- Информационный блок -->
        <div class="info-block">
          <div class="info-card">
            <div class="info-header">
              <InfoIcon class="info-icon" />
              <h3 class="info-title">Что случилось?</h3>
            </div>
            <div class="info-body">
              <p class="info-text">
                Запрашиваемая страница не существует или была перемещена.
                <span v-if="errorDetails" class="error-details">
                  {{ errorDetails }}
                </span>
              </p>
              <div class="contact-section">
                <p class="contact-text">
                  Если проблема повторяется, обратитесь к администратору:
                </p>
                <div class="email-section">
                  <MailIcon class="email-icon" />
                  <span class="email-address">{{ systemAdminEmail }}</span>
                  <BaseButton variant="ghost"
                              size="xs"
                              @click="copyEmail"
                              class="copy-button">
                    <CopyIcon class="copy-icon" />
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Быстрые ссылки -->
        <div class="quick-links" v-if="quickLinks.length > 0">
          <div class="links-header">
            <h3 class="links-title">Доступные разделы</h3>
            <p class="links-description">Перейдите к одному из основных разделов системы</p>
          </div>

          <div class="links-grid">
            <div v-for="link in quickLinks"
                 :key="link.path"
                 class="link-card"
                 @click="navigateTo(link.path)">
              <div class="link-content">
                <div class="link-icon-wrapper">
                  <component :is="link.icon" class="link-icon" />
                </div>
                <div class="link-info">
                  <h4 class="link-title">{{ link.title }}</h4>
                  <p class="link-subtitle">{{ link.description }}</p>
                </div>
                <ChevronRightIcon class="link-arrow" />
              </div>
            </div>
          </div>
        </div>

        <!-- Подвал -->
        <div class="not-found-footer">
          <div class="footer-content">
            <span class="footer-text">{{ appName }} Client</span>
            <span class="footer-separator">•</span>
            <span class="footer-text">Версия {{ appVersion }}</span>
            <span class="footer-separator">•</span>
            <span class="footer-text">© {{ currentYear }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Уведомление о копировании -->
    <div class="copy-notification" :class="{ 'show': showNotification }">
      <CheckCircleIcon class="notification-icon" />
      <span>Скопировано в буфер обмена</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'

  // Иконки
  import {
    ArrowLeftIcon,
    ChevronRightIcon,
    AlertTriangleIcon,
    InfoIcon,
    ReportIcon,
    ScriptIcon,
    HostIcon,
    HomeIcon,
    SearchIcon,
    MonitorIcon,
    MailIcon,
    CopyIcon,
    CheckCircleIcon,
    SunIcon,
    MoonIcon,
  } from '@/assets/icons'

  // Компоненты
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue'

  // Конфигурация
  import { APP_CONFIG } from '@/core/config/app.config'

  // Store и сервисы
  import { useAuthStore } from '@/framework/stores'
  import { useThemeStore } from '@/framework/stores/core/theme/theme.store'
  import { logger } from '@/core/services/logger/logger.service'
  import { notificationService } from '@/core/services/notification/notification.service'

  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const themeStore = useThemeStore()

  // Реактивные данные
  const currentPath = ref(route.path)
  const canGoBack = ref(false)
  const showNotification = ref(false)

  // Вычисляемые свойства из конфигурации
  const appVersion = computed(() => APP_CONFIG.APP.VERSION)
  const appName = computed(() => APP_CONFIG.APP.NAME)
  const systemAdminEmail = computed(() => APP_CONFIG.APP.ADMIN_EMAIL)
  const currentYear = computed(() => new Date().getFullYear())

  // Тема
  const isDarkTheme = computed(() => themeStore.resolved === 'dark')
  const isLightTheme = computed(() => themeStore.resolved === 'light')
  const themeIcon = computed(() => isDarkTheme.value ? SunIcon : MoonIcon)

  // Информация о пользователе
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)

  // Проверка прав доступа
  const hasMonitoringAccess = computed(() =>
    isAuthenticated.value && authStore.hasPermission('view_monitoring')
  )

  const hasReportsAccess = computed(() =>
    isAuthenticated.value && authStore.hasPermission('view_reports')
  )

  const hasScriptsAccess = computed(() =>
    isAuthenticated.value && authStore.hasPermission('manage_scripts')
  )

  const hasUnitsAccess = computed(() =>
    isAuthenticated.value && authStore.hasPermission('view_units')
  )

  // Быстрые ссылки
  const quickLinks = computed(() => {
    const links = [
      {
        path: '/audit/monitoring',
        title: 'Мониторинг',
        description: 'Реальное время, статистика, графики',
        icon: MonitorIcon,
        permission: 'view_monitoring',
      },
      {
        path: '/audit/reports',
        title: 'Отчеты',
        description: 'Аналитика, экспорт, история',
        icon: ReportIcon,
        permission: 'view_reports',
      },
      {
        path: '/audit/units',
        title: 'Войсковые части',
        description: 'Структура, оборудование, сети',
        icon: HostIcon,
        permission: 'view_units',
      },
      {
        path: '/audit/scripts',
        title: 'Скрипты',
        description: 'Аудит, проверки, автоматизация',
        icon: ScriptIcon,
        permission: 'manage_scripts',
      }
    ]

    return links.filter(link => authStore.hasPermission(link.permission))
  })

  // Информация об ошибке
  const errorDetails = computed(() => {
    if (route.params.pathMatch) {
      return `Путь: "${route.params.pathMatch}" не существует в системе.`
    }
    return null
  })

  // Методы навигации
  const goBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      goToHome()
    }
  }

  const goToHome = () => {
    if (isAuthenticated.value) {
      router.push('/audit/monitoring')
    } else {
      router.push('/login')
    }
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  // Переключение темы
  const toggleTheme = () => {
    themeStore.toggleTheme()
  }

  // Копирование email
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(systemAdminEmail.value)
      showNotification.value = true
      setTimeout(() => {
        showNotification.value = false
      }, APP_CONFIG.NOTIFICATION.DEFAULT_DURATION)
    } catch (error) {
      notificationService.error('Не удалось скопировать email')
    }
  }

  // Хуки жизненного цикла
  onMounted(() => {
    canGoBack.value = window.history.length > 1

    logger.warn('Страница не найдена', {
      path: currentPath.value,
      user: user.value?.username,
      timestamp: new Date().toISOString(),
      appName: appName.value,
      appVersion: appVersion.value
    })
  })

  // Обработка обновления маршрута
  onBeforeRouteUpdate((to, from) => {
    currentPath.value = to.path
  })
</script>

<style scoped>
  /* Базовые стили */
  .not-found-view {
    min-height: 100vh;
    background: var(--color-background);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    font-family: var(--font-family-sans);
    color: var(--color-text-primary);
    transition: background-color var(--transition-normal), color var(--transition-normal);
  }

  .not-found-container {
    width: 100%;
    max-width: 56rem; /* Уменьшено с 64rem */
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    border: 1px solid var(--color-border);
  }

  /* Хедер */
  .not-found-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4) var(--space-5); /* Уменьшено с var(--space-6) */
    background: var(--color-surface-hover);
    border-bottom: 1px solid var(--color-border);
  }

  .header-logo {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .logo-icon {
    width: 1.75rem; /* Уменьшено с 2rem */
    height: 1.75rem; /* Уменьшено с 2rem */
    color: var(--color-primary);
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .logo-primary {
    font-size: var(--text-lg); /* Уменьшено с var(--text-xl) */
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .logo-secondary {
    font-size: var(--text-xs); /* Уменьшено с var(--text-sm) */
    color: var(--color-text-muted);
  }

  .header-actions {
    display: flex;
    gap: var(--space-3);
    align-items: center;
  }

  .back-button,
  .theme-button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2rem; /* Уменьшено с 2.25rem */
    border-radius: var(--radius-md);
    font-weight: var(--font-weight-medium);
    transition: all var(--transition-fast);
  }

  .back-button {
    min-width: 5rem; /* Уменьшено с 6rem */
    padding: 0 var(--space-2); /* Уменьшено с var(--space-3) */
  }

    .back-button .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-1-5); /* Уменьшено с var(--space-2) */
      width: 100%;
      height: 100%;
    }

  .theme-button {
    width: 2rem; /* Уменьшено с 2.25rem */
    padding: 0;
    min-width: unset;
  }

  .button-icon {
    width: 0.875rem; /* Уменьшено с 1rem */
    height: 0.875rem; /* Уменьшено с 1rem */
  }

  .theme-icon {
    width: 1rem; /* Уменьшено с 1.125rem */
    height: 1rem; /* Уменьшено с 1.125rem */
  }

  /* Основной контент */
  .not-found-content {
    padding: var(--space-6) var(--space-5); /* Уменьшено с var(--space-8) var(--space-6) */
    display: flex;
    flex-direction: column;
    gap: var(--space-6); /* Уменьшено с var(--space-8) */
    align-items: center;
  }

  /* Блок с ошибкой */
  .error-block {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5); /* Уменьшено с var(--space-6) */
    max-width: 40rem; /* Уменьшено с 48rem */
  }

  .error-code {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3); /* Уменьшено с var(--space-4) */
  }

  .digit {
    font-size: 5rem; /* Уменьшено с 6rem */
    font-weight: var(--font-weight-black);
    color: transparent;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    background-clip: text;
    line-height: 1;
  }

  .error-icon-wrapper {
    width: 6rem; /* Уменьшено с 7rem */
    height: 6rem; /* Уменьшено с 7rem */
    background: var(--gradient-primary);
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-primary);
  }

  .error-icon {
    width: 2rem; /* Уменьшено с 2.5rem */
    height: 2rem; /* Уменьшено с 2.5rem */
    color: var(--color-white);
  }

  .error-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-2); /* Уменьшено с var(--space-3) */
  }

  .error-title {
    font-size: var(--text-3xl); /* Уменьшено с var(--text-4xl) */
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.2;
  }

  .error-description {
    font-size: var(--text-base); /* Уменьшено с var(--text-lg) */
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .path-highlight {
    background: var(--color-surface-hover);
    padding: var(--space-0-5) var(--space-1-5); /* Уменьшено с var(--space-1) var(--space-2) */
    border-radius: var(--radius-md);
    font-family: var(--font-family-mono);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    border: 1px solid var(--color-border);
    margin-left: var(--space-1); /* Уменьшено с var(--space-2) */
    display: inline-block;
  }

  /* Основная кнопка действия */
  .primary-action {
    margin-top: var(--space-1); /* Уменьшено с var(--space-2) */
  }

  .home-button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.75rem; /* Уменьшено с 3rem */
    padding: 0 var(--space-4); /* Уменьшено с var(--space-6) */
    background: var(--color-primary);
    color: var(--color-text-on-primary);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm); /* Уменьшено с var(--text-base) */
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-width: 10rem; /* Уменьшено с 12rem */
  }

    .home-button .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-1-5); /* Уменьшено с var(--space-2) */
      width: 100%;
      height: 100%;
    }

    .home-button:hover {
      background: var(--color-primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-primary);
    }

  .button-icon-lg {
    width: 1.125rem; /* Уменьшено с 1.25rem */
    height: 1.125rem; /* Уменьшено с 1.25rem */
  }

  /* Информационный блок */
  .info-block {
    width: 100%;
    max-width: 40rem; /* Уменьшено с 48rem */
  }

  .info-card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    overflow: hidden;
  }

  .info-header {
    display: flex;
    align-items: center;
    gap: var(--space-2); /* Уменьшено с var(--space-3) */
    padding: var(--space-3) var(--space-4); /* Уменьшено с var(--space-4) var(--space-6) */
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface-hover);
  }

  .info-icon {
    width: 1.125rem; /* Уменьшено с 1.25rem */
    height: 1.125rem; /* Уменьшено с 1.25rem */
    color: var(--color-info);
  }

  .info-title {
    font-size: var(--text-base); /* Уменьшено с var(--text-lg) */
    font-weight: var(--font-weight-semibold);
    color: var(--color-info-dark);
    margin: 0;
  }

  .info-body {
    padding: var(--space-4); /* Уменьшено с var(--space-6) */
    display: flex;
    flex-direction: column;
    gap: var(--space-3); /* Уменьшено с var(--space-4) */
  }

  .info-text {
    font-size: var(--text-sm); /* Уменьшено с var(--text-base) */
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.6;
  }

  .error-details {
    display: block;
    margin-top: var(--space-2); /* Уменьшено с var(--space-3) */
    background: var(--color-surface-hover);
    padding: var(--space-2) var(--space-3); /* Уменьшено с var(--space-3) var(--space-4) */
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    font-family: var(--font-family-mono);
    font-size: var(--text-xs); /* Уменьшено с var(--text-sm) */
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  .contact-section {
    background: var(--color-surface-hover);
    padding: var(--space-3); /* Уменьшено с var(--space-4) */
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: var(--space-2); /* Уменьшено с var(--space-3) */
  }

  .contact-text {
    font-size: var(--text-sm); /* Уменьшено с var(--text-base) */
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .email-section {
    display: flex;
    align-items: center;
    gap: var(--space-2); /* Уменьшено с var(--space-3) */
    padding: var(--space-2) var(--space-3); /* Уменьшено с var(--space-3) var(--space-4) */
    background: var(--color-surface);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .email-icon {
    width: 1rem; /* Уменьшено с 1.125rem */
    height: 1rem; /* Уменьшено с 1.125rem */
    color: var(--color-text-muted);
  }

  .email-address {
    flex: 1;
    font-family: var(--font-family-mono);
    font-size: var(--text-xs); /* Уменьшено с var(--text-sm) */
    color: var(--color-text-primary);
    word-break: break-all;
  }

  .copy-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem; /* Уменьшено с 2.25rem */
    height: 2rem; /* Уменьшено с 2.25rem */
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

    .copy-button:hover {
      border-color: var(--color-primary);
      background: var(--color-surface-hover);
    }

  .copy-icon {
    width: 0.875rem; /* Уменьшено с 1rem */
    height: 0.875rem; /* Уменьшено с 1rem */
    color: var(--color-text-muted);
  }

  /* Быстрые ссылки */
  .quick-links {
    width: 100%;
    max-width: 40rem; /* Уменьшено с 48rem */
    display: flex;
    flex-direction: column;
    gap: var(--space-4); /* Уменьшено с var(--space-6) */
  }

  .links-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: var(--space-1); /* Уменьшено с var(--space-2) */
  }

  .links-title {
    font-size: var(--text-xl); /* Уменьшено с var(--text-2xl) */
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .links-description {
    font-size: var(--text-sm); /* Уменьшено с var(--text-base) */
    color: var(--color-text-secondary);
    margin: 0;
  }

  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); /* Уменьшено с 16rem */
    gap: var(--space-3); /* Уменьшено с var(--space-4) */
  }

  .link-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
    overflow: hidden;
  }

    .link-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--color-primary);
    }

  .link-content {
    display: flex;
    align-items: center;
    gap: var(--space-3); /* Уменьшено с var(--space-4) */
    padding: var(--space-3); /* Уменьшено с var(--space-4) */
    height: 100%;
  }

  .link-icon-wrapper {
    width: 2.5rem; /* Уменьшено с 3rem */
    height: 2.5rem; /* Уменьшено с 3rem */
    background: color-mix(in srgb, var(--color-info) 10%, transparent);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .link-icon {
    width: 1.125rem; /* Уменьшено с 1.25rem */
    height: 1.125rem; /* Уменьшено с 1.25rem */
    color: var(--color-info);
  }

  .link-info {
    flex: 1;
    text-align: left;
    min-width: 0;
  }

  .link-title {
    font-size: var(--text-sm); /* Уменьшено с var(--text-base) */
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-0-5); /* Уменьшено с var(--space-1) */
    line-height: 1.3;
  }

  .link-subtitle {
    font-size: var(--text-xs); /* Уменьшено с var(--text-sm) */
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .link-arrow {
    width: 1rem; /* Уменьшено с 1.125rem */
    height: 1rem; /* Уменьшено с 1.125rem */
    color: var(--color-text-muted);
    opacity: 0;
    transform: translateX(-4px);
    transition: all var(--transition-fast);
  }

  .link-card:hover .link-arrow {
    opacity: 1;
    transform: translateX(0);
    color: var(--color-primary);
  }

  /* Подвал */
  .not-found-footer {
    padding: var(--space-3) 0; /* Уменьшено с var(--space-4) */
    border-top: 1px solid var(--color-border);
    width: 100%;
    max-width: 40rem; /* Уменьшено с 48rem */
  }

  .footer-content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-3); /* Уменьшено с var(--space-4) */
    color: var(--color-text-muted);
    font-size: var(--text-xs); /* Уменьшено с var(--text-sm) */
    flex-wrap: wrap;
  }

  .footer-text {
    color: var(--color-text-muted);
  }

  .footer-separator {
    color: var(--color-border);
  }

  /* Уведомление о копировании */
  .copy-notification {
    position: fixed;
    bottom: var(--space-4); /* Уменьшено с var(--space-6) */
    right: var(--space-4); /* Уменьшено с var(--space-6) */
    background: var(--color-success);
    color: var(--color-white);
    padding: var(--space-2) var(--space-3); /* Уменьшено с var(--space-3) var(--space-4) */
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    gap: var(--space-2); /* Уменьшено с var(--space-3) */
    transform: translateY(100px);
    opacity: 0;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-success);
    z-index: var(--z-toast);
    font-size: var(--text-xs); /* Уменьшено с var(--text-sm) */
    max-width: 18rem; /* Уменьшено с 20rem */
  }

    .copy-notification.show {
      transform: translateY(0);
      opacity: 1;
    }

  .notification-icon {
    width: 1rem; /* Уменьшено с 1.125rem */
    height: 1rem; /* Уменьшено с 1.125rem */
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .not-found-view {
      padding: var(--space-2);
    }

    .not-found-container {
      border-radius: var(--radius-md);
    }

    .not-found-header {
      padding: var(--space-2) var(--space-3); /* Уменьшено с var(--space-3) var(--space-4) */
      flex-direction: column;
      gap: var(--space-2); /* Уменьшено с var(--space-3) */
    }

    .not-found-content {
      padding: var(--space-4) var(--space-3); /* Уменьшено с var(--space-6) var(--space-4) */
      gap: var(--space-4); /* Уменьшено с var(--space-6) */
    }

    .error-code {
      gap: var(--space-2); /* Уменьшено с var(--space-3) */
    }

    .digit {
      font-size: 3.5rem; /* Уменьшено с 4rem */
    }

    .error-icon-wrapper {
      width: 4rem; /* Уменьшено с 5rem */
      height: 4rem; /* Уменьшено с 5rem */
    }

    .error-icon {
      width: 1.5rem; /* Уменьшено с 2rem */
      height: 1.5rem; /* Уменьшено с 2rem */
    }

    .error-title {
      font-size: var(--text-xl); /* Уменьшено с var(--text-2xl) */
    }

    .error-description {
      font-size: var(--text-sm); /* Уменьшено с var(--text-base) */
    }

    .path-highlight {
      display: block;
      margin: var(--space-1) 0 0 0; /* Уменьшено с var(--space-2) */
    }

    .info-header,
    .info-body {
      padding: var(--space-2); /* Уменьшено с var(--space-4) */
    }

    .links-grid {
      grid-template-columns: 1fr;
    }

    .footer-content {
      flex-direction: column;
      gap: var(--space-1); /* Уменьшено с var(--space-2) */
      text-align: center;
    }

    .footer-separator {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .error-code {
      flex-direction: column;
      gap: var(--space-2); /* Уменьшено с var(--space-3) */
    }

    .digit {
      font-size: 3rem; /* Уменьшено с 3.5rem */
    }

    .error-icon-wrapper {
      order: -1;
      width: 3.5rem; /* Уменьшено с 4rem */
      height: 3.5rem; /* Уменьшено с 4rem */
    }

    .home-button {
      width: 100%;
    }

    .not-found-container {
      max-width: 100%;
    }

    .not-found-header {
      padding: var(--space-2); /* Уменьшено с var(--space-3) */
    }

    .not-found-content {
      padding: var(--space-3); /* Уменьшено с var(--space-4) */
      gap: var(--space-3); /* Уменьшено с var(--space-4) */
    }

    .back-button {
      min-width: 4rem; /* Уменьшено с 5rem */
    }

    .copy-notification {
      bottom: var(--space-3); /* Уменьшено с var(--space-4) */
      right: var(--space-3); /* Уменьшено с var(--space-4) */
      left: var(--space-3); /* Уменьшено с var(--space-4) */
      max-width: none;
    }
  }
</style>
