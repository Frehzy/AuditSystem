// src/framework/ui/types/common.ts
/**
 * Базовые типы для UI компонентов
 */

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'

export interface BaseComponentProps {
  size?: Size
  disabled?: boolean
  loading?: boolean
}

export interface ColorScheme {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
}

export interface ThemeConfig {
  colors: ColorScheme
  spacing: Record<Size, string>
  borderRadius: Record<Size, string>
  typography: {
    fontFamily: string
    fontSize: Record<Size, string>
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
}
