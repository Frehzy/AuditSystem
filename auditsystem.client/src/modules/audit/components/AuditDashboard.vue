<template>

  <div class="audit-dashboard">
    <!-- Заголовок и быстрые действия --> <div class="audit-dashboard__header"> <div class="audit-dashboard__title-section"> <h1 class="audit-dashboard__title">Обзор безопасности Astra Linux</h1> <p class="audit-dashboard__subtitle">Мониторинг и управление системой аудита</p> </div> <div class="audit-dashboard__actions"> <BaseButton @click="startQuickScan" variant="primary" :loading="isScanning"> <ScanIcon class="button-icon" /> Быстрое сканирование </BaseButton> <BaseButton @click="generateReport" variant="secondary"> <ReportIcon class="button-icon" /> Создать отчет </BaseButton> </div> </div>
    <!-- Статистика безопасности -->
    <div class="audit-dashboard__stats">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--security">
          <ShieldIcon />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ securityScore }}%</div>
          <div class="stat-card__label">Уровень безопасности</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--critical">
          <AlertIcon />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ criticalIssues }}</div>
          <div class="stat-card__label">Критические уязвимости</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--systems">
          <ServerIcon />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ monitoredSystems }}</div>
          <div class="stat-card__label">Мониторируемые системы</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--scan">
          <ScanIcon />
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ lastScanTime }}</div>
          <div class="stat-card__label">Последнее сканирование</div>
        </div>
      </div>
    </div>

    <!-- Основной контент в две колонки -->
    <div class="audit-dashboard__content">
      <!-- Левая колонка -->
      <div class="audit-dashboard__main">
        <!-- Активность сканирования -->
        <div class="dashboard-card">
          <div class="dashboard-card__header">
            <h3 class="dashboard-card__title">Активность сканирования</h3>
            <BaseButton @click="showScanHistory" variant="text" size="sm">
              История
            </BaseButton>
          </div>
          <div class="scan-activity">
            <div v-if="currentScan" class="scan-progress">
              <div class="scan-progress__header">
                <span class="scan-progress__title">Сканирование выполняется</span>
                <span class="scan-progress__percent">{{ currentScan.progress }}%</span>
              </div>
              <div class="scan-progress__bar">
                <div class="scan-progress__fill" :style="{ width: `${currentScan.progress}%` }"></div>
              </div>
              <div class="scan-progress__info">
                <span>{{ currentScan.currentCheck }}</span>
                <span v-if="currentScan.estimatedTimeRemaining">
                  Осталось: {{ formatTime(currentScan.estimatedTimeRemaining) }}
                </span>
              </div>
            </div>
            <div v-else class="scan-activity__empty">
              <ScanIcon class="scan-activity__empty-icon" />
              <p>Сканирование не запущено</p>
              <BaseButton @click="startQuickScan" variant="primary" size="sm">
                Запустить сканирование
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Последние уязвимости -->
        <div class="dashboard-card">
          <div class="dashboard-card__header">
            <h3 class="dashboard-card__title">Последние уязвимости</h3>
            <BaseButton @click="showAllVulnerabilities" variant="text" size="sm">
              Все уязвимости
            </BaseButton>
          </div>
          <div class="vulnerabilities-list">
            <div v-for="vuln in recentVulnerabilities" :key="vuln.id" class="vulnerability-item">
              <div class="vulnerability-item__severity" :class="`severity--${vuln.severity}`"></div>
              <div class="vulnerability-item__content">
                <div class="vulnerability-item__title">{{ vuln.title }}</div>
                <div class="vulnerability-item__meta">
                  <span class="vulnerability-item__category">{{ vuln.category }}</span>
                  <span class="vulnerability-item__date">{{ formatDate(vuln.detectedAt) }}</span>
                </div>
              </div>
              <div class="vulnerability-item__actions">
                <BaseButton @click="showVulnerabilityDetails(vuln)" variant="text" size="sm">
                  Подробнее
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Правая колонка -->
      <div class="audit-dashboard__sidebar">
        <!-- Статус систем -->
        <div class="dashboard-card">
          <div class="dashboard-card__header">
            <h3 class="dashboard-card__title">Статус систем</h3>
          </div>
          <div class="systems-status">
            <div v-for="system in systems" :key="system.id" class="system-item">
              <div class="system-item__icon" :class="`status--${system.status}`">
                <ServerIcon />
              </div>
              <div class="system-item__info">
                <div class="system-item__name">{{ system.name }}</div>
                <div class="system-item__details">
                  <span class="system-item__version">v{{ system.version }}</span>
                  <span class="system-item__security" :class="`security--${system.securityLevel}`">
                    {{ system.securityLevel }}
                  </span>
                </div>
              </div>
              <div class="system-item__last-scan">
                {{ system.lastScan ? formatRelativeTime(system.lastScan) : 'Никогда' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Быстрые рекомендации -->
        <div class="dashboard-card">
          <div class="dashboard-card__header">
            <h3 class="dashboard-card__title">Рекомендации</h3>
          </div>
          <div class="recommendations">
            <div v-for="rec in recommendations" :key="rec.id" class="recommendation-item">
              <div class="recommendation-item__icon">
                <InfoIcon />
              </div>
              <div class="recommendation-item__content">
                <div class="recommendation-item__text">{{ rec.text }}</div>
                <BaseButton @click="applyRecommendation(rec)" variant="text" size="sm">
                  Применить
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">import { ref, computed, onMounted } from 'vue'; import { useRouter } from 'vue-router'; import { BaseButton } from '@/framework/ui'; import { ShieldIcon, ScanIcon, ReportIcon, AlertIcon, ServerIcon, InfoIcon } from '@/assets/icons'; import { useAudit } from '../composables/useAudit'; import type { AuditSystem, Vulnerability } from '../api/audit.types'; const router = useRouter(); const audit = useAudit(); const securityScore = ref(87); const criticalIssues = ref(3); const monitoredSystems = ref(5); const lastScanTime = ref('2 часа назад'); const isScanning = ref(false); const systems = computed(() => audit.systems.value); const currentScan = computed(() => audit.currentScan.value); const recentVulnerabilities = computed(() => audit.recentVulnerabilities.value); const recommendations = ref([ { id: 1, text: 'Обновить ядро системы до последней версии' }, { id: 2, text: 'Настроить правила межсетевого экрана' }, { id: 3, text: 'Проверить права доступа к системным файлам' } ]); const startQuickScan = async (): Promise<void> => { isScanning.value = true; try { await audit.startScan({ systemId: 'local', scanType: 'quick', options: { checkNetwork: true, checkFilesystem: true, checkUsers: true, checkServices: true, checkFirewall: true } }); } finally { isScanning.value = false; } }; const generateReport = (): void => { audit.generateReport(); }; const showScanHistory = (): void => { router.push('/audit/reports'); }; const showAllVulnerabilities = (): void => { router.push('/audit/scan'); }; const showVulnerabilityDetails = (vuln: Vulnerability): void => { console.log('Show vulnerability details:', vuln); }; const applyRecommendation = (rec: any): void => { console.log('Apply recommendation:', rec); }; const formatDate = (dateString: string): string => { return new Date(dateString).toLocaleDateString('ru-RU'); }; const formatTime = (ms: number): string => { const minutes = Math.floor(ms / 60000); return `${minutes} мин`; }; const formatRelativeTime = (dateString: string): string => { const date = new Date(dateString); const now = new Date(); const diff = now.getTime() - date.getTime(); const hours = Math.floor(diff / 3600000); if (hours < 1) return 'Менее часа'; if (hours < 24) return `${hours} ч назад`; return `${Math.floor(hours / 24)} дн назад`; }; onMounted(() => { audit.loadSystems(); audit.loadRecentVulnerabilities(); });</script>
<style scoped>
  .audit-dashboard {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .audit-dashboard__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
  }

  .audit-dashboard__title-section {
    flex: 1;
  }

  .audit-dashboard__title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .audit-dashboard__subtitle {
    font-size: 16px;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .audit-dashboard__actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
  }

  .button-icon {
    width: 16px;
    height: 16px;
  }

  .audit-dashboard__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .stat-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all var(--transition-normal);
  }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

  .stat-card__icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .stat-card__icon--security {
    background: var(--gradient-success);
  }

  .stat-card__icon--critical {
    background: var(--gradient-error);
  }

  .stat-card__icon--systems {
    background: var(--gradient-info);
  }

  .stat-card__icon--scan {
    background: var(--gradient-warning);
  }

  .stat-card__content {
    flex: 1;
  }

  .stat-card__value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .stat-card__label {
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  .audit-dashboard__content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }

  .dashboard-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 20px;
  }

  .dashboard-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .dashboard-card__title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
  /* Стили для активности сканирования */

  .scan-progress__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .scan-progress__title {
    font-weight: 600;
  }

  .scan-progress__percent {
    font-weight: 700;
    color: var(--color-primary);
  }

  .scan-progress__bar {
    height: 6px;
    background: var(--color-border);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .scan-progress__fill {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: 3px;
    transition: width var(--transition-normal);
  }

  .scan-progress__info {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .scan-activity__empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--color-text-muted);
  }

  .scan-activity__empty-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
  /* Стили для списка уязвимостей */

  .vulnerabilities-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .vulnerability-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--color-surface-hover);
    border-radius: 8px;
    transition: all var(--transition-fast);
  }

    .vulnerability-item:hover {
      background: var(--color-surface-active);
    }

  .vulnerability-item__severity {
    width: 4px;
    height: 32px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .severity--critical {
    background: var(--color-error);
  }

  .severity--high {
    background: var(--color-warning);
  }

  .severity--medium {
    background: var(--color-info);
  }

  .severity--low {
    background: var(--color-success);
  }

  .vulnerability-item__content {
    flex: 1;
  }

  .vulnerability-item__title {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .vulnerability-item__meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--color-text-muted);
  }
  /* Стили для статуса систем */

  .systems-status {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .system-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--color-surface-hover);
    border-radius: 8px;
  }

  .system-item__icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .status--online {
    background: var(--color-success);
  }

  .status--offline {
    background: var(--color-error);
  }

  .status--scanning {
    background: var(--color-warning);
  }

  .system-item__info {
    flex: 1;
  }

  .system-item__name {
    font-weight: 600;
    margin-bottom: 2px;
  }

  .system-item__details {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .system-item__security {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .security--critical {
    background: var(--color-error-light);
    color: var(--color-error-dark);
  }

  .security--high {
    background: var(--color-warning-light);
    color: var(--color-warning-dark);
  }

  .security--medium {
    background: var(--color-info-light);
    color: var(--color-info-dark);
  }

  .security--low {
    background: var(--color-success-light);
    color: var(--color-success-dark);
  }

  .system-item__last-scan {
    font-size: 12px;
    color: var(--color-text-muted);
  }
  /* Стили для рекомендаций */

  .recommendations {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .recommendation-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: var(--color-surface-hover);
    border-radius: 8px;
  }

  .recommendation-item__icon {
    width: 20px;
    height: 20px;
    color: var(--color-info);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .recommendation-item__content {
    flex: 1;
  }

  .recommendation-item__text {
    font-size: 14px;
    margin-bottom: 8px;
    line-height: 1.4;
  }
  /* Адаптивность */

  @media (max-width: 1024px) {
    .audit-dashboard__content {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .audit-dashboard__header {
      flex-direction: column;
      align-items: stretch;
    }

    .audit-dashboard__actions {
      justify-content: stretch;
    }

    .audit-dashboard__stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .audit-dashboard__stats {
      grid-template-columns: 1fr;
    }
  }
</style>
