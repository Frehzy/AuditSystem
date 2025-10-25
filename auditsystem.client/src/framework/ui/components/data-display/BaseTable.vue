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
                  <ChevronUpIcon v-if="sortBy === column.key && sortOrder === 'asc'" :size="12" />
                  <ChevronDownIcon v-else-if="sortBy === column.key && sortOrder === 'desc'" :size="12" />
                  <MoreVerticalIcon v-else :size="12" />
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
                :class="getCellClass(column)"
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
            <InfoIcon :size="32" class="base-table__empty-icon" />
            <div class="base-table__empty-text">
              {{ emptyText }}
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && totalItems > pageSize" class="base-table__pagination">
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
  formatter?: (value: any) => string
}

interface Props {
  columns: TableColumn[]
  data: any[]
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
  rowKey?: string | ((row: any) => string)
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
  rowKey: 'id',
})

const emit = defineEmits<{
  'sort': [key: string, order: 'asc' | 'desc']
  'row-click': [row: any]
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
  'max-height': props.pagination ? 'calc(100% - 60px)' : '100%',
}))

const sortedData = computed(() => {
  if (!sortBy.value || !props.sortable) {
    return props.data
  }

  return [...props.data].sort((a, b) => {
    const aValue = a[sortBy.value]
    const bValue = b[sortBy.value]

    if (aValue === bValue) return 0

    let result = 0
    if (aValue < bValue) result = -1
    if (aValue > bValue) result = 1

    return sortOrder.value === 'asc' ? result : -result
  })
})

const getRowKey = (row: any, index: number): string => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return row[props.rowKey] || `row-${index}`
}

const getHeaderClass = (column: TableColumn) => [
  'base-table__header-cell',
  {
    'base-table__header-cell--sortable': column.sortable,
    'base-table__header-cell--sorted': sortBy.value === column.key,
  },
]

const getHeaderStyle = (column: TableColumn) => ({
  width: column.width,
  textAlign: column.align,
})

const getRowClass = (row: any, index: number) => [
  'base-table__row',
  {
    'base-table__row--even': index % 2 === 0,
    'base-table__row--odd': index % 2 === 1,
  },
]

const getCellClass = (column: TableColumn) => [
  'base-table__cell',
  `base-table__cell--align-${column.align || 'left'}`,
]

const getCellStyle = (column: TableColumn) => ({
  width: column.width,
})

const formatCellValue = (value: any, column: TableColumn): string => {
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

const handleRowClick = (row: any) => {
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
    overflow: hidden;
  }

  .base-table__container {
    flex: 1;
    overflow: auto;
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
    z-index: 1;
    box-shadow: 0 1px 0 var(--color-border);
  }

  .base-table__header-cell {
    padding: var(--space-md);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
    transition: background-color var(--transition-fast);
    user-select: none;
  }

  .base-table__header-cell--sortable {
    cursor: pointer;
  }

    .base-table__header-cell--sortable:hover {
      background: var(--color-surface-hover);
    }

  .base-table__header-cell--sorted {
    color: var(--color-primary);
  }

  .base-table__header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xs);
  }

  .base-table__header-text {
    flex: 1;
  }

  .base-table__sort-indicator {
    display: flex;
    align-items: center;
    color: var(--color-text-muted);
    transition: color var(--transition-fast);
  }

  .base-table__header-cell--sorted .base-table__sort-indicator {
    color: var(--color-primary);
  }

  /* Body */
  .base-table__body {
    background: var(--color-surface);
  }

  .base-table__row {
    transition: background-color var(--transition-fast);
    border-bottom: 1px solid var(--color-border-card);
  }

  .base-table--hoverable .base-table__row:hover {
    background: var(--color-surface-hover);
  }

  .base-table--striped .base-table__row--even {
    background: var(--color-background-card);
  }

  .base-table--striped .base-table__row--odd {
    background: var(--color-surface);
  }

  .base-table__cell {
    padding: var(--space-md);
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border-card);
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

  /* Compact variant */
  .base-table--compact .base-table__header-cell,
  .base-table--compact .base-table__cell {
    padding: var(--space-sm);
    font-size: 0.875rem;
  }

  /* Bordered variant */
  .base-table--bordered .base-table__header-cell,
  .base-table--bordered .base-table__cell {
    border: 1px solid var(--color-border);
  }

  /* Empty state */
  .base-table__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-3xl);
    color: var(--color-text-muted);
    text-align: center;
  }

  .base-table__empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    max-width: 300px;
  }

  .base-table__empty-icon {
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  .base-table__empty-text {
    font-size: 0.875rem;
    line-height: 1.5;
  }

  /* Pagination */
  .base-table__pagination {
    padding: var(--space-md);
    border-top: 1px solid var(--color-border);
    background: var(--color-background-card);
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
      padding: var(--space-xs) var(--space-sm);
    }
  }
</style>
