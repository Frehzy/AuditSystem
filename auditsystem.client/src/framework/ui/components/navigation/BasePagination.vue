<!-- src/framework/ui/components/navigation/BasePagination.vue -->
<template>
  <nav class="base-pagination" :class="paginationClasses" role="navigation" aria-label="Пагинация">
    <!-- Предыдущая страница -->
    <button :disabled="!hasPrev"
            @click="goToPage(currentPage - 1)"
            class="base-pagination__prev"
            aria-label="Предыдущая страница">
      <ChevronLeftIcon :size="16" />
    </button>

    <!-- Номера страниц -->
    <div class="base-pagination__pages">
      <!-- Первая страница -->
      <button v-if="showFirstPage"
              @click="goToPage(1)"
              class="base-pagination__page"
              :class="{ 'base-pagination__page--active': currentPage === 1 }"
              aria-label="Перейти на страницу 1">
        1
      </button>

      <!-- Многоточие после первой страницы -->
      <span v-if="showStartEllipsis" class="base-pagination__ellipsis">
        ...
      </span>

      <!-- Основные страницы -->
      <button v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              class="base-pagination__page"
              :class="{ 'base-pagination__page--active': currentPage === page }"
              :aria-label="`Перейти на страницу ${page}`"
              :aria-current="currentPage === page ? 'page' : undefined">
        {{ page }}
      </button>

      <!-- Многоточие перед последней страницей -->
      <span v-if="showEndEllipsis" class="base-pagination__ellipsis">
        ...
      </span>

      <!-- Последняя страница -->
      <button v-if="showLastPage"
              @click="goToPage(totalPages)"
              class="base-pagination__page"
              :class="{ 'base-pagination__page--active': currentPage === totalPages }"
              :aria-label="`Перейти на страницу ${totalPages}`">
        {{ totalPages }}
      </button>
    </div>

    <!-- Следующая страница -->
    <button :disabled="!hasNext"
            @click="goToPage(currentPage + 1)"
            class="base-pagination__next"
            aria-label="Следующая страница">
      <ChevronRightIcon :size="16" />
    </button>

    <!-- Информация о страницах -->
    <div v-if="showInfo" class="base-pagination__info">
      Показано {{ startItem }}-{{ endItem }} из {{ totalItems }}
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ChevronLeftIcon, ChevronRightIcon } from '@/assets/icons'

  interface Props {
    modelValue: number
    totalItems: number
    pageSize?: number
    maxVisiblePages?: number
    showInfo?: boolean
    size?: 'sm' | 'md' | 'lg'
  }

  const props = withDefaults(defineProps<Props>(), {
    pageSize: 10,
    maxVisiblePages: 5,
    showInfo: false,
    size: 'md',
  })

  const emit = defineEmits<{
    'update:modelValue': [page: number]
    'change': [page: number]
  }>()

  const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))
  const currentPage = computed(() => props.modelValue)

  const hasPrev = computed(() => currentPage.value > 1)
  const hasNext = computed(() => currentPage.value < totalPages.value)

  const startItem = computed(() => (currentPage.value - 1) * props.pageSize + 1)
  const endItem = computed(() => Math.min(currentPage.value * props.pageSize, props.totalItems))

  const paginationClasses = computed(() => [
    'base-pagination',
    `base-pagination--${props.size}`,
    {
      'base-pagination--with-info': props.showInfo,
    },
  ])

  const visiblePages = computed(() => {
    const pages: number[] = []
    const half = Math.floor(props.maxVisiblePages / 2)

    let start = Math.max(1, currentPage.value - half)
    let end = Math.min(totalPages.value, start + props.maxVisiblePages - 1)

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
    return visiblePages.value[0] > 1
  })

  const showLastPage = computed(() => {
    return visiblePages.value[visiblePages.value.length - 1] < totalPages.value
  })

  const showStartEllipsis = computed(() => {
    return visiblePages.value[0] > 2
  })

  const showEndEllipsis = computed(() => {
    return visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      emit('update:modelValue', page)
      emit('change', page)
    }
  }
</script>

<style scoped>
  .base-pagination {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: 0.875rem;
  }

  .base-pagination__prev,
  .base-pagination__next,
  .base-pagination__page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0 var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-weight: var(--font-weight-medium);
  }

    .base-pagination__prev:hover,
    .base-pagination__next:hover,
    .base-pagination__page:hover {
      background: var(--color-surface-hover);
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    .base-pagination__prev:disabled,
    .base-pagination__next:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--color-surface-disabled);
    }

      .base-pagination__prev:disabled:hover,
      .base-pagination__next:disabled:hover {
        border-color: var(--color-border);
        color: var(--color-text-muted);
      }

  .base-pagination__page--active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }

    .base-pagination__page--active:hover {
      background: var(--color-primary-dark);
      border-color: var(--color-primary-dark);
      color: white;
    }

  .base-pagination__pages {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .base-pagination__ellipsis {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.5rem;
    height: 2.5rem;
    color: var(--color-text-muted);
    user-select: none;
  }

  .base-pagination__info {
    margin-left: auto;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  /* Size variants */
  .base-pagination--sm .base-pagination__prev,
  .base-pagination--sm .base-pagination__next,
  .base-pagination--sm .base-pagination__page,
  .base-pagination--sm .base-pagination__ellipsis {
    min-width: 2rem;
    height: 2rem;
    font-size: 0.8125rem;
  }

  .base-pagination--lg .base-pagination__prev,
  .base-pagination--lg .base-pagination__next,
  .base-pagination--lg .base-pagination__page,
  .base-pagination--lg .base-pagination__ellipsis {
    min-width: 3rem;
    height: 3rem;
    font-size: 1rem;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-pagination__info {
      display: none;
    }

    .base-pagination__pages {
      gap: 0.25rem;
    }

    .base-pagination__ellipsis {
      min-width: 2rem;
    }
  }

  @media (max-width: 480px) {
    .base-pagination {
      gap: 0.25rem;
    }

    .base-pagination__pages {
      display: none;
    }

    .base-pagination--with-info .base-pagination__info {
      display: block;
      margin-left: 0;
      text-align: center;
      flex: 1;
    }
  }
</style>
