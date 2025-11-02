<!-- src/framework/ui/components/navigation/BasePagination.vue -->
<template>
  <nav class="base-pagination" :class="paginationClasses" role="navigation" aria-label="Пагинация">
    <!-- Информация о страницах -->
    <div v-if="showInfo" class="pagination-info">
      <span class="info-text">Показано {{ startItem }}-{{ endItem }} из {{ totalItems }}</span>
    </div>

    <div class="pagination-controls">
      <!-- Предыдущая страница -->
      <BaseButton @click="goToPage(currentPage - 1)"
                  variant="secondary"
                  size="sm"
                  :disabled="!hasPrev"
                  class="nav-button prev-button"
                  aria-label="Предыдущая страница">
        <ChevronLeftIcon class="button-icon" />
        <span class="button-text">Назад</span>
      </BaseButton>

      <!-- Номера страниц -->
      <div class="pages-container">
        <!-- Первая страница -->
        <button v-if="showFirstPage"
                @click="goToPage(1)"
                class="page-button"
                :class="{ 'page-button--active': currentPage === 1 }"
                aria-label="Перейти на страницу 1">
          1
        </button>

        <!-- Многоточие после первой страницы -->
        <span v-if="showStartEllipsis" class="page-ellipsis">
          <MoreHorizontalIcon class="ellipsis-icon" />
        </span>

        <!-- Основные страницы -->
        <button v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                class="page-button"
                :class="{
                  'page-button--active': currentPage === page,
                  'page-button--current': currentPage === page
                }"
                :aria-label="`Перейти на страницу ${page}`"
                :aria-current="currentPage === page ? 'page' : undefined">
          {{ page }}
        </button>

        <!-- Многоточие перед последней страницей -->
        <span v-if="showEndEllipsis" class="page-ellipsis">
          <MoreHorizontalIcon class="ellipsis-icon" />
        </span>

        <!-- Последняя страница -->
        <button v-if="showLastPage"
                @click="goToPage(totalPages)"
                class="page-button"
                :class="{ 'page-button--active': currentPage === totalPages }"
                :aria-label="`Перейти на страницу ${totalPages}`">
          {{ totalPages }}
        </button>
      </div>

      <!-- Следующая страница -->
      <BaseButton @click="goToPage(currentPage + 1)"
                  variant="secondary"
                  size="sm"
                  :disabled="!hasNext"
                  class="nav-button next-button"
                  aria-label="Следующая страница">
        <span class="button-text">Вперед</span>
        <ChevronRightIcon class="button-icon" />
      </BaseButton>
    </div>

    <!-- Быстрая навигация -->
    <div v-if="showQuickJump" class="quick-jump">
      <label class="jump-label">Перейти к:</label>
      <BaseInput v-model="jumpPage"
                 type="number"
                 :min="1"
                 :max="totalPages"
                 size="sm"
                 class="jump-input"
                 @keyup.enter="handleJumpToPage"
                 @blur="handleJumpToPage" />
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue'
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue'
  import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from '@/assets/icons'

  interface Props {
    modelValue: number
    totalItems: number
    pageSize?: number
    maxVisiblePages?: number
    showInfo?: boolean
    showQuickJump?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'minimal' | 'extended'
  }

  const props = withDefaults(defineProps<Props>(), {
    pageSize: 10,
    maxVisiblePages: 7,
    showInfo: true,
    showQuickJump: false,
    size: 'md',
    variant: 'default'
  })

  const emit = defineEmits<{
    'update:modelValue': [page: number]
    'change': [page: number]
    'page-size-change': [size: number]
  }>()

  const jumpPage = ref('')

  const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))
  const currentPage = computed(() => props.modelValue)

  const hasPrev = computed(() => currentPage.value > 1)
  const hasNext = computed(() => currentPage.value < totalPages.value)

  const startItem = computed(() => {
    if (props.totalItems === 0) return 0
    return (currentPage.value - 1) * props.pageSize + 1
  })

  const endItem = computed(() => {
    if (props.totalItems === 0) return 0
    return Math.min(currentPage.value * props.pageSize, props.totalItems)
  })

  const paginationClasses = computed(() => [
    `pagination-size--${props.size}`,
    `pagination-variant--${props.variant}`,
    {
      'pagination--with-info': props.showInfo,
      'pagination--with-quick-jump': props.showQuickJump,
    },
  ])

  const visiblePages = computed(() => {
    if (totalPages.value <= 1) return []

    const pages: number[] = []
    const half = Math.floor(props.maxVisiblePages / 2)

    let start = Math.max(1, currentPage.value - half)
    const end = Math.min(totalPages.value, start + props.maxVisiblePages - 1)

    // Adjust start if we're near the end
    if (end - start + 1 < props.maxVisiblePages) {
      start = Math.max(1, end - props.maxVisiblePages + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  })

  const showFirstPage = computed(() => {
    return visiblePages.value.length > 0 && visiblePages.value[0] > 1
  })

  const showLastPage = computed(() => {
    return visiblePages.value.length > 0 &&
      visiblePages.value[visiblePages.value.length - 1] < totalPages.value
  })

  const showStartEllipsis = computed(() => {
    return showFirstPage.value && visiblePages.value[0] > 2
  })

  const showEndEllipsis = computed(() => {
    return showLastPage.value &&
      visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      emit('update:modelValue', page)
      emit('change', page)
    }
  }

  const handleJumpToPage = () => {
    if (!jumpPage.value) return

    const page = parseInt(jumpPage.value)
    if (page >= 1 && page <= totalPages.value) {
      goToPage(page)
    }
    jumpPage.value = ''
  }

  // Сбрасываем jumpPage при изменении текущей страницы
  watch(currentPage, () => {
    jumpPage.value = ''
  })
</script>

<style scoped>
  .base-pagination {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .pagination-info {
    display: flex;
    justify-content: center;
  }

  .info-text {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .pages-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin: 0 var(--spacing-sm);
  }

  /* Navigation Buttons */
  .nav-button {
    min-width: auto;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  .button-text {
    font-weight: var(--font-weight-medium);
  }

  /* Page Buttons */
  .page-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0 var(--spacing-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-weight: var(--font-weight-medium);
    font-size: 0.875rem;
  }

    .page-button:hover:not(.page-button--active) {
      background: var(--color-surface-hover);
      border-color: var(--color-primary);
      color: var(--color-primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

  .page-button--active,
  .page-button--current {
    background: var(--gradient-primary);
    border-color: var(--color-primary);
    color: white;
    font-weight: var(--font-weight-semibold);
    box-shadow: var(--shadow-primary);
  }

    .page-button--active:hover,
    .page-button--current:hover {
      background: var(--gradient-primary-hover);
      border-color: var(--color-primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

  /* Ellipsis */
  .page-ellipsis {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.5rem;
    height: 2.5rem;
    color: var(--color-text-muted);
    user-select: none;
  }

  .ellipsis-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  /* Quick Jump */
  .quick-jump {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-border-light);
  }

  .jump-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
  }

  .jump-input {
    width: 80px;
  }

  /* Size Variants */
  .pagination-size--sm .page-button {
    min-width: 2rem;
    height: 2rem;
    font-size: 0.8125rem;
  }

  .pagination-size--sm .page-ellipsis {
    min-width: 2rem;
    height: 2rem;
  }

  .pagination-size--sm .nav-button {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .pagination-size--lg .page-button {
    min-width: 3rem;
    height: 3rem;
    font-size: 1rem;
  }

  .pagination-size--lg .page-ellipsis {
    min-width: 3rem;
    height: 3rem;
  }

  .pagination-size--lg .nav-button {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  /* Variant Styles */
  .pagination-variant--minimal {
    background: transparent;
    border: none;
    padding: 0;
  }

    .pagination-variant--minimal .pagination-controls {
      gap: var(--spacing-xs);
    }

    .pagination-variant--minimal .page-button {
      background: transparent;
      border: 1px solid transparent;
    }

      .pagination-variant--minimal .page-button:hover:not(.page-button--active) {
        background: var(--color-surface-hover);
        border-color: var(--color-border);
      }

  .pagination-variant--extended {
    background: var(--color-background-card);
    border: 1px solid var(--color-border-card);
    box-shadow: var(--shadow-sm);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .base-pagination {
      padding: var(--spacing-sm);
      gap: var(--spacing-sm);
    }

    .pagination-controls {
      gap: var(--spacing-xs);
    }

    .pages-container {
      margin: 0 var(--spacing-xs);
      gap: 0.25rem;
    }

    .button-text {
      display: none;
    }

    .nav-button {
      padding: var(--spacing-sm);
    }

    .quick-jump {
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .jump-input {
      width: 100%;
      max-width: 120px;
    }
  }

  @media (max-width: 480px) {
    .pages-container {
      display: none;
    }

    .pagination-variant--extended .pages-container {
      display: flex;
    }

    .pagination-info {
      order: 1;
      margin-top: var(--spacing-sm);
    }
  }

  /* Focus Styles */
  .page-button:focus-visible,
  .nav-button:focus-visible {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: var(--shadow-focus);
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .page-button,
    .nav-button {
      transition: none;
    }

      .page-button:hover:not(.page-button--active),
      .page-button--active:hover,
      .page-button--current:hover {
        transform: none;
      }
  }

  /* High Contrast */
  @media (prefers-contrast: high) {
    .page-button {
      border: 2px solid var(--color-text-primary);
    }

    .page-button--active,
    .page-button--current {
      border: 2px solid var(--color-primary);
    }
  }
</style>
