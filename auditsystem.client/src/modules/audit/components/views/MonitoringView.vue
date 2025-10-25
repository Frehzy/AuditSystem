<!-- src/modules/audit/components/views/MonitoringView.vue -->
<template>
  <div class="monitoring-view">
    <div class="monitoring-view__header">
      <h1 class="monitoring-view__title">Мониторинг сети</h1>
      <p class="monitoring-view__subtitle">Управление сканированием и отслеживание состояния систем</p>
    </div>

    <div class="monitoring-view__content">
      <!-- Активное сканирование -->
      <div class="monitoring-section">
        <div class="section-header">
          <h2 class="section-title">Активное сканирование</h2>
          <BaseButton @click="startQuickScan"
                      variant="primary"
                      :loading="isScanning"
                      :disabled="!!currentScan"
                      class="scan-button">
            <ScanIcon class="button-icon" />
            Запустить сканирование
          </BaseButton>
        </div>

        <div class="scan-progress" v-if="currentScan">
          <div class="scan-progress__header">
            <div class="scan-progress__info">
              <span class="scan-progress__title">Сканирование выполняется</span>
              <span class="scan-progress__subtitle">{{ currentScan.currentAction }}</span>
            </div>
            <span class="scan-progress__percent">{{ currentScan.progress }}%</span>
          </div>

          <div class="scan-progress__bar">
            <div class="scan-progress__fill"
                 :style="{ width: `${currentScan.progress}%` }" />
          </div>

          <div class="scan-progress__details">
            <span>Обработано: {{ currentScan.devicesProcessed }}/{{ currentScan.totalDevices }}</span>
            <span v-if="currentScan.estimatedTimeRemaining">
              Осталось: {{ formatTime(currentScan.estimatedTimeRemaining) }}
            </span>
          </div>
        </div>

        <div class="empty-state" v-else>
          <ScanIcon class="empty-state__icon" />
          <p class="empty-state__text">Сканирование не запущено</p>
          <p class="empty-state__description">Запустите сканирование для проверки состояния сети</p>
        </div>
      </div>

      <!-- Войсковые части -->
      <div class="monitoring-section">
        <div class="section-header">
          <h2 class="section-title">Войсковые части</h2>
          <BaseButton @click="showCreateUnitDialog"
                      variant="secondary"
                      size="sm"
                      class="add-button">
            <PlusIcon class="button-icon" />
            Добавить часть
          </BaseButton>
        </div>

        <div class="units-grid">
          <div v-for="unit in units"
               :key="unit.id"
               class="unit-card"
               @click="selectUnit(unit)"
               :class="{ 'unit-card--selected': selectedUnit?.id === unit.id }">
            <div class="unit-card__header">
              <h3 class="unit-card__title">{{ unit.name }}</h3>
              <span class="unit-card__status" :class="`status--${unit.status}`">
                {{ getStatusText(unit.status) }}
              </span>
            </div>

            <div class="unit-card__content">
              <div class="unit-card__info">
                <span class="unit-card__location">{{ unit.location }}</span>
                <span class="unit-card__subnets">{{ unit.subnets.length }} подсетей</span>
              </div>

              <div class="unit-card__description" v-if="unit.description">
                {{ unit.description }}
              </div>
            </div>

            <div class="unit-card__footer">
              <span class="unit-card__date">
                Создано: {{ formatDate(unit.createdAt) }}
              </span>
            </div>
          </div>
        </div>

        <div class="empty-state" v-if="units.length === 0">
          <ServerIcon class="empty-state__icon" />
          <p class="empty-state__text">Войсковые части не найдены</p>
          <BaseButton @click="showCreateUnitDialog"
                      variant="primary"
                      class="add-button">
            <PlusIcon class="button-icon" />
            Добавить первую часть
          </BaseButton>
        </div>
      </div>

      <!-- Выбранная часть -->
      <div class="monitoring-section" v-if="selectedUnit">
        <div class="section-header">
          <h2 class="section-title">Подсети: {{ selectedUnit.name }}</h2>
          <BaseButton @click="showCreateSubnetDialog"
                      variant="secondary"
                      size="sm"
                      class="add-button">
            <PlusIcon class="button-icon" />
            Добавить подсеть
          </BaseButton>
        </div>

        <div class="subnets-table">
          <div class="table-header">
            <div class="table-cell">Название</div>
            <div class="table-cell">Сеть</div>
            <div class="table-cell">Устройства</div>
            <div class="table-cell">Последнее сканирование</div>
            <div class="table-cell">Действия</div>
          </div>

          <div v-for="subnet in selectedUnit.subnets"
               :key="subnet.id"
               class="table-row">
            <div class="table-cell">
              <div class="subnet-name">
                <strong>{{ subnet.name }}</strong>
                <span v-if="subnet.description" class="subnet-description">
                  {{ subnet.description }}
                </span>
              </div>
            </div>

            <div class="table-cell">
              <code class="network-address">{{ subnet.network }}/{{ subnet.mask }}</code>
            </div>

            <div class="table-cell">
              <span class="devices-count">{{ subnet.devicesCount }} устройств</span>
            </div>

            <div class="table-cell">
              <span class="last-scan" :class="{ 'never-scanned': !subnet.lastScan }">
                {{ subnet.lastScan ? formatRelativeTime(subnet.lastScan) : 'Никогда' }}
              </span>
            </div>

            <div class="table-cell">
              <div class="actions">
                <BaseButton @click="startSubnetScan(subnet)"
                            variant="primary"
                            size="sm"
                            :loading="isScanning"
                            class="scan-subnet-btn">
                  <ScanIcon class="button-icon" />
                  Сканировать
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import BaseButton from '@/framework/ui/BaseButton.vue';
  import { ScanIcon, ServerIcon, PlusIcon } from '@/assets/icons';
  import { useAudit } from '@/modules/audit/composables/useAudit';
  import type { MilitaryUnit, Subnet } from '@/modules/audit/api/audit.types';

  const audit = useAudit();

  const isScanning = ref(false);
  const selectedUnit = ref<MilitaryUnit | null>(null);

  const units = computed(() => audit.units.value);
  const currentScan = computed(() => audit.currentScan.value);

  const startQuickScan = async (): Promise<void> => {
    if (!selectedUnit.value || selectedUnit.value.subnets.length === 0) {
      alert('Выберите войсковую часть с подсетями для сканирования');
      return;
    }

    isScanning.value = true;
    try {
      await audit.startScan({
        subnetId: selectedUnit.value.subnets[0].id,
        scanType: 'quick'
      });
    } finally {
      isScanning.value = false;
    }
  };

  const startSubnetScan = async (subnet: Subnet): Promise<void> => {
    isScanning.value = true;
    try {
      await audit.startScan({
        subnetId: subnet.id,
        scanType: 'comprehensive'
      });
    } finally {
      isScanning.value = false;
    }
  };

  const selectUnit = (unit: MilitaryUnit): void => {
    selectedUnit.value = unit;
  };

  const showCreateUnitDialog = (): void => {
    console.log('Show create unit dialog');
  };

  const showCreateSubnetDialog = (): void => {
    if (!selectedUnit.value) {
      alert('Сначала выберите войсковую часть');
      return;
    }
    console.log('Show create subnet dialog');
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: 'Активна',
      deployed: 'На выезде',
      headquarters: 'Штаб'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return minutes > 0 ? `${minutes} мин ${seconds} сек` : `${seconds} сек`;
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return 'Менее часа назад';
    if (hours < 24) return `${hours} ч назад`;
    return `${Math.floor(hours / 24)} дн назад`;
  };

  onMounted(() => {
    audit.loadMilitaryUnits();
  });
</script>

<style scoped>
  .monitoring-view {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .monitoring-view__header {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .monitoring-view__title {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
  }

  .monitoring-view__subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin: 0;
    font-weight: 400;
  }

  .monitoring-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
  }

    .monitoring-section:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.75rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.625rem;
  }

  .scan-button,
  .add-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

    .scan-button:hover,
    .add-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.3);
    }

  /* Прогресс сканирования */
  .scan-progress {
    background: linear-gradient(135deg, var(--color-surface-hover), var(--color-surface));
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid var(--color-border);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  }

  .scan-progress__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .scan-progress__info {
    flex: 1;
  }

  .scan-progress__title {
    font-weight: 700;
    display: block;
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
    color: var(--color-text-primary);
  }

  .scan-progress__subtitle {
    color: var(--color-text-secondary);
    font-size: 0.95rem;
  }

  .scan-progress__percent {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-primary);
  }

  .scan-progress__bar {
    height: 0.75rem;
    background: var(--color-border);
    border-radius: 1rem;
    overflow: hidden;
    margin-bottom: 1rem;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .scan-progress__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
    border-radius: 1rem;
    transition: width 0.5s ease;
    box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.4);
  }

  .scan-progress__details {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-text-secondary);
  }

  .empty-state__icon {
    width: 4rem;
    height: 4rem;
    margin-bottom: 1.5rem;
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  .empty-state__text {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--color-text-primary);
  }

  .empty-state__description {
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
  }

  /* Сетка войсковых частей */
  .units-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .unit-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

    .unit-card:hover {
      transform: translateY(-4px);
      border-color: var(--color-primary);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }

  .unit-card--selected {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary-light), var(--color-surface));
    box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.15);
  }

  .unit-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .unit-card__title {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
    flex: 1;
  }

  .unit-card__status {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.375rem 0.75rem;
    border-radius: 2rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .status--active {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .status--deployed {
    background: var(--color-warning-light);
    color: var(--color-warning);
  }

  .status--headquarters {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  .unit-card__content {
    margin-bottom: 1rem;
  }

  .unit-card__info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }

  .unit-card__location {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .unit-card__subnets {
    color: var(--color-text-muted);
  }

  .unit-card__description {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .unit-card__footer {
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
  }

  .unit-card__date {
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  /* Таблица подсетей */
  .subnets-table {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr 1.2fr;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: var(--color-surface-hover);
    border-bottom: 1px solid var(--color-border);
    font-weight: 700;
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr 1.2fr;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    transition: background-color 0.2s ease;
  }

    .table-row:hover {
      background: var(--color-surface-hover);
    }

    .table-row:last-child {
      border-bottom: none;
    }

  .table-cell {
    display: flex;
    align-items: center;
    color: var(--color-text-primary);
  }

  .subnet-name {
    display: flex;
    flex-direction: column;
  }

  .subnet-description {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }

  .network-address {
    background: var(--color-surface-hover);
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.85rem;
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
  }

  .devices-count {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .last-scan {
    color: var(--color-success);
    font-weight: 500;
  }

  .never-scanned {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .scan-subnet-btn {
    transition: all 0.3s ease;
  }

    .scan-subnet-btn:hover {
      transform: translateY(-1px);
    }

  /* Responsive */
  @media (max-width: 1200px) {
    .monitoring-view__title {
      font-size: 2rem;
    }

    .monitoring-section {
      padding: 1.75rem;
    }

    .units-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }
  }

  @media (max-width: 1024px) {
    .monitoring-view__title {
      font-size: 1.75rem;
    }

    .monitoring-view__subtitle {
      font-size: 1.125rem;
    }

    .monitoring-section {
      padding: 1.5rem;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .table-header,
    .table-row {
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .table-cell:nth-child(3),
    .table-cell:nth-child(4),
    .table-cell:nth-child(5) {
      display: none;
    }
  }

  @media (max-width: 900px) {
    .monitoring-view {
      gap: 1.5rem;
    }

    .monitoring-view__header {
      padding-bottom: 1rem;
    }

    .units-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .scan-progress {
      padding: 1.5rem;
    }
  }

  @media (max-width: 800px) {
    .monitoring-view__title {
      font-size: 1.5rem;
    }

    .monitoring-view__subtitle {
      font-size: 1rem;
    }

    .monitoring-section {
      padding: 1.25rem;
      border-radius: 1rem;
    }

    .section-title {
      font-size: 1.25rem;
    }

    .scan-progress {
      padding: 1.25rem;
    }

    .scan-progress__header {
      flex-direction: column;
      gap: 0.75rem;
    }

    .scan-progress__percent {
      align-self: flex-end;
    }
  }
</style>
