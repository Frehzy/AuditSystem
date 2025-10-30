<!-- src/framework/ui/components/data-display/BaseTable.vue -->
<template>
  <div class="base-table" :class="tableClasses">
    <!-- Table container with scroll -->
    <div class="base-table__container" :style="containerStyle">
      <table class="base-table__table">
        <!-- Header -->
        <thead class="base-table__header">
          <tr>
            <th v-for="column in columns"
                :key="column.key"
                :class="getHeaderClass(column)"
                :style="getHeaderStyle(column)"
                @click="handleSort(column)">
              <div class="base-table__header-content">
                <span class="base-table__header-text">
                  {{ column.title }}
                </span>
                <span v-if="column.sortable" class="base-table__sort-indicator">
                  <ChevronUpIcon v-if="sortBy === column.key && sortOrder === 'asc'"
                                 :size="16"
                                 class="sort-icon" />
                  <ChevronDownIcon v-else-if="sortBy === column.key && sortOrder === 'desc'"
                                   :size="16"
                                   class="sort-icon" />
                  <MoreVerticalIcon v-else
                                    :size="16"
                                    class="sort-icon sort-icon--inactive" />
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="base-table__body">
          <tr v-for="(row, rowIndex) in sortedData"
              :key="getRowKey(row, rowIndex)"
              :class="getRowClass(row, rowIndex)"
              @click="handleRowClick(row)">
            <td v-for="column in columns"
                :key="column.key"
                :class="getCellClass(column, row)"
                :style="getCellStyle(column)">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ formatCellValue(row[column.key], column) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div v-if="sortedData.length === 0" class="base-table__empty">
        <slot name="empty">
          <div class="base-table__empty-content">
            <InfoIcon :size="48" class="base-table__empty-icon" />
            <div class="base-table__empty-text">
              <h4 class="empty-title">{{ emptyText }}</h4>
              <p class="empty-description" v-if="emptyDescription">{{ emptyDescription }}</p>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && totalItems > pageSize" class="base-table__pagination">
      <div class="pagination-info">
        <span class="pagination-text">
          Показано {{ showingStart }}-{{ showingEnd }} из {{ totalItems }}
        </span>
      </div>
      <BasePagination :model-value="currentPage"
                      :total-items="totalItems"
                      :page-size="pageSize"
                      @update:model-value="handlePageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ChevronUpIcon, ChevronDownIcon, MoreVerticalIcon, InfoIcon } from '@/assets/icons'
  import BasePagination from '../navigation/BasePagination.vue'

  interface TableColumn {
    key: string
    title: string
    width?: string
    align?: 'left' | 'center' | 'right'
    sortable?: boolean
    formatter?: (value: unknown) => string
    cellClass?: string | ((value: unknown, row: Record<string, unknown>) => string)
  }

  interface Props {
    columns: TableColumn[]
    data: Record<string, unknown>[]
    striped?: boolean
    hoverable?: boolean
    bordered?: boolean
    compact?: boolean
    sortable?: boolean
    pagination?: boolean
    pageSize?: number
    currentPage?: number
    totalItems?: number
    emptyText?: string
    emptyDescription?: string
    rowKey?: string | ((row: Record<string, unknown>, index: number) => string)
    rowClass?: string | ((row: Record<string, unknown>, index: number) => string)
  }

  const props = withDefaults(defineProps<Props>(), {
    striped: false,
    hoverable: true,
    bordered: false,
    compact: false,
    sortable: true,
    pagination: false,
    pageSize: 10,
    currentPage: 1,
    totalItems: 0,
    emptyText: 'Нет данных для отображения',
    emptyDescription: '',
    rowKey: 'id',
  })

  const emit = defineEmits<{
    'sort': [key: string, order: 'asc' | 'desc']
    'row-click': [row: Record<string, unknown>]
    'update:currentPage': [page: number]
  }>()

  const sortBy = ref<string>('')
  const sortOrder = ref<'asc' | 'desc'>('asc')

  const tableClasses = computed(() => [
    'base-table',
    {
      'base-table--striped': props.striped,
      'base-table--hoverable': props.hoverable,
      'base-table--bordered': props.bordered,
      'base-table--compact': props.compact,
    },
  ])

  const containerStyle = computed(() => ({
    'max-height': props.pagination ? 'calc(100% - 80px)' : '100%',
  }))

  const sortedData = computed(() => {
    if (!sortBy.value || !props.sortable) {
      return props.data
    }

    return [...props.data].sort((a, b) => {
      const aValue = a[sortBy.value] as string | number
      const bValue = b[sortBy.value] as string | number

      if (aValue === bValue) return 0

      let result = 0
      if (aValue < bValue) result = -1
      if (aValue > bValue) result = 1

      return sortOrder.value === 'asc' ? result : -result
    })
  })

  const showingStart = computed(() => {
    return ((props.currentPage || 1) - 1) * props.pageSize + 1
  })

  const showingEnd = computed(() => {
    return Math.min((props.currentPage || 1) * props.pageSize, props.totalItems || 0)
  })

  const getRowKey = (row: Record<string, unknown>, index: number): string => {
    if (typeof props.rowKey === 'function') {
      return props.rowKey(row, index)
    }
    return String(row[props.rowKey] || `row-${index}`)
  }

  const getHeaderClass = (column: TableColumn) => [
    'base-table__header-cell',
    {
      'base-table__header-cell--sortable': column.sortable,
      'base-table__header-cell--sorted': sortBy.value === column.key,
      'base-table__header-cell--align-center': column.align === 'center',
      'base-table__header-cell--align-right': column.align === 'right',
    },
  ]

  const getHeaderStyle = (column: TableColumn) => ({
    width: column.width,
    textAlign: column.align,
  })

  const getRowClass = (row: Record<string, unknown>, index: number) => [
    'base-table__row',
    {
      'base-table__row--even': index % 2 === 0,
      'base-table__row--odd': index % 2 === 1,
      'base-table__row--clickable': props.hoverable,
    },
    typeof props.rowClass === 'function' ? props.rowClass(row, index) : props.rowClass,
  ]

  const getCellClass = (column: TableColumn, row: Record<string, unknown>) => [
    'base-table__cell',
    `base-table__cell--align-${column.align || 'left'}`,
    {
      'base-table__cell--numeric': typeof row[column.key] === 'number',
    },
    typeof column.cellClass === 'function' ? column.cellClass(row[column.key], row) : column.cellClass,
  ]

  const getCellStyle = (column: TableColumn) => ({
    width: column.width,
  })

  const formatCellValue = (value: unknown, column: TableColumn): string => {
    if (column.formatter) {
      return column.formatter(value)
    }
    return value != null ? String(value) : ''
  }

  const handleSort = (column: TableColumn) => {
    if (!column.sortable || !props.sortable) return

    if (sortBy.value === column.key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = column.key
      sortOrder.value = 'asc'
    }

    emit('sort', column.key, sortOrder.value)
  }

  const handleRowClick = (row: Record<string, unknown>) => {
    emit('row-click', row)
  }

  const handlePageChange = (page: number) => {
    emit('update:currentPage', page)
  }
</script>

<style scoped>
  .base-table {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal);
  }

  .base-table__container {
    flex: 1;
    overflow: auto;
    background: var(--color-surface);
  }

  .base-table__table {
    width: 100%;
    border-collapse: collapse;
    background: var(--color-surface);
  }

  /* Header */
  .base-table__header {
    position: sticky;
    top: 0;
    background: var(--color-background-card);
    z-index: 2;
    box-shadow: 0 2px 4px var(--color-border-light);
  }

  .base-table__header-cell {
    padding: var(--spacing-lg);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
    transition: all var(--transition-fast);
    user-select: none;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .base-table__header-cell--align-center {
    text-align: center;
  }

  .base-table__header-cell--align-right {
    text-align: right;
  }

  .base-table__header-cell--sortable {
    cursor: pointer;
  }

    .base-table__header-cell--sortable:hover {
      background: var(--color-surface-hover);
      color: var(--color-primary);
    }

  .base-table__header-cell--sorted {
    color: var(--color-primary);
    background: var(--color-primary-50);
  }

  .base-table__header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }

  .base-table__header-text {
    flex: 1;
  }

  .base-table__sort-indicator {
    display: flex;
    align-items: center;
    transition: color var(--transition-fast);
  }

  .sort-icon {
    color: var(--color-text-muted);
    transition: all var(--transition-fast);
  }

  .sort-icon--inactive {
    opacity: 0.5;
  }

  .base-table__header-cell--sorted .sort-icon {
    color: var(--color-primary);
  }

  .base-table__header-cell--sortable:hover .sort-icon {
    color: var(--color-primary);
    opacity: 1;
  }

  /* Body */
  .base-table__body {
    background: var(--color-surface);
  }

  .base-table__row {
    transition: all var(--transition-fast);
    border-bottom: 1px solid var(--color-border-card);
    background: var(--color-surface);
  }

  .base-table__row--clickable {
    cursor: pointer;
  }

  .base-table--hoverable .base-table__row--clickable:hover {
    background: var(--color-surface-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .base-table--striped .base-table__row--even {
    background: var(--color-background-card);
  }

  .base-table--striped .base-table__row--odd {
    background: var(--color-surface);
  }

  .base-table--striped .base-table__row--even.base-table__row--clickable:hover {
    background: var(--color-surface-hover);
  }

  .base-table__cell {
    padding: var(--spacing-lg);
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border-card);
    font-size: 0.875rem;
    transition: all var(--transition-fast);
  }

  .base-table__cell--align-left {
    text-align: left;
  }

  .base-table__cell--align-center {
    text-align: center;
  }

  .base-table__cell--align-right {
    text-align: right;
  }

  .base-table__cell--numeric {
    font-family: var(--font-family-mono);
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;
  }

  /* Compact variant */
  .base-table--compact .base-table__header-cell,
  .base-table--compact .base-table__cell {
    padding: var(--spacing-md);
    font-size: 0.8125rem;
  }

  /* Bordered variant */
  .base-table--bordered .base-table__header-cell,
  .base-table--bordered .base-table__cell {
    border: 1px solid var(--color-border);
  }

  .base-table--bordered .base-table__header-cell {
    border-bottom: 2px solid var(--color-border);
  }

  /* Empty state */
  .base-table__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-muted);
    text-align: center;
    background: var(--color-surface);
  }

  .base-table__empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
    max-width: 320px;
  }

  .base-table__empty-icon {
    color: var(--color-text-muted);
    opacity: 0.4;
  }

  .empty-title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .empty-description {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
    margin: 0;
  }

  /* Pagination */
  .base-table__pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
    background: var(--color-background-card);
    min-height: 80px;
  }

  .pagination-info {
    display: flex;
    align-items: center;
  }

  .pagination-text {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium, 500);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .base-table__container {
      overflow-x: auto;
    }

    .base-table__header-cell,
    .base-table__cell {
      white-space: nowrap;
    }

    .base-table--compact .base-table__header-cell,
    .base-table--compact .base-table__cell {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .base-table__pagination {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: stretch;
      text-align: center;
    }

    .base-table__empty {
      padding: var(--spacing-xl);
    }

    .base-table__empty-content {
      max-width: 280px;
    }
  }

  @media (max-width: 480px) {
    .base-table__header-cell {
      padding: var(--spacing-md);
      font-size: 0.8125rem;
    }

    .base-table__cell {
      padding: var(--spacing-md);
      font-size: 0.8125rem;
    }

    .base-table__empty {
      padding: var(--spacing-lg);
    }

    .empty-title {
      font-size: 1rem;
    }
  }

  /* Animation for row hover */
  @keyframes rowHover {
    from {
      background: var(--color-surface);
    }

    to {
      background: var(--color-surface-hover);
    }
  }

  .base-table--hoverable .base-table__row--clickable:hover {
    animation: rowHover 0.2s ease-out;
  }

  /* Focus styles for accessibility */
  .base-table__row--clickable:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
    background: var(--color-surface-hover);
  }

  /* Selection state */
  .base-table__row--selected {
    background: var(--color-primary-50) !important;
    border-left: 3px solid var(--color-primary);
  }

    .base-table__row--selected .base-table__cell {
      color: var(--color-primary);
      font-weight: var(--font-weight-medium, 500);
    }

  /* Status colors for cells */
  .base-table__cell--status-success {
    color: var(--color-success);
    background: var(--color-success-light);
  }

  .base-table__cell--status-warning {
    color: var(--color-warning);
    background: var(--color-warning-light);
  }

  .base-table__cell--status-error {
    color: var(--color-error);
    background: var(--color-error-light);
  }

  .base-table__cell--status-info {
    color: var(--color-info);
    background: var(--color-info-light);
  }
</style>
