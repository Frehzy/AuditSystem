<template>
  <div class="empty-state">
    <div class="empty-icon">
      <ServerIcon class="icon" />
    </div>
    <div class="empty-content">
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">
        {{ description }}
      </p>
      <div class="empty-actions">
        <BaseButton @click="$emit('create-unit')"
                    variant="primary"
                    size="lg">
          <PlusIcon class="button-icon" />
          Добавить войсковую часть
        </BaseButton>
        <BaseButton v-if="hasFilters"
                    @click="$emit('clear-filters')"
                    variant="secondary"
                    size="lg">
          Сбросить фильтры
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import { ServerIcon, PlusIcon } from '@/assets/icons';

  interface Props {
    hasFilters?: boolean;
  }

  interface Emits {
    (e: 'create-unit'): void;
    (e: 'clear-filters'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const title = computed(() =>
    props.hasFilters ? 'Войсковые части не найдены' : 'Войсковые части отсутствуют'
  );

  const description = computed(() =>
    props.hasFilters
      ? 'Попробуйте изменить параметры поиска или сбросить фильтры'
      : 'Добавьте первую войсковую часть для начала работы с системой'
  );
</script>

<style scoped>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xl);
    padding: var(--spacing-3xl);
    text-align: center;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 2px dashed var(--color-border);
  }

  .empty-icon {
    width: 6rem;
    height: 6rem;
    border-radius: var(--radius-full);
    background: var(--color-surface-hover);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
  }

    .empty-icon .icon {
      width: 3rem;
      height: 3rem;
    }

  .empty-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    max-width: 400px;
  }

  .empty-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
  }

  .empty-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .empty-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    margin-top: var(--spacing-md);
  }

  @media (max-width: 768px) {
    .empty-actions {
      flex-direction: column;
      align-items: center;
    }

    .empty-state {
      padding: var(--spacing-2xl);
    }
  }
</style>
