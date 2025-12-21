/**
 * Маршруты модуля аудита
 */

import type { RouteRecordRaw } from 'vue-router';

const auditRoutes: RouteRecordRaw[] = [
  {
    path: '/audit',
    name: 'Audit',
    component: () => import('@/modules/audit/views/AuditView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Аудит - AuditSystem Client',
      layout: 'default',
      transition: 'slide-right',
      breadcrumb: 'Аудит',
      category: 'navigation'
    },
    redirect: '/audit/monitoring',
    children: [
      {
        path: 'monitoring',
        name: 'Monitoring',
        component: () => import('@/modules/audit/components/views/MonitoringView.vue'),
        meta: {
          title: 'Мониторинг - AuditSystem Client',
          breadcrumb: 'Мониторинг',
          category: 'monitoring',
          requiresPermissions: ['view_monitoring']
        }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/modules/audit/components/views/ReportsView.vue'),
        meta: {
          title: 'Отчеты - AuditSystem Client',
          breadcrumb: 'Отчеты',
          category: 'reports',
          requiresPermissions: ['view_reports']
        }
      },
      {
        path: 'scripts',
        name: 'Scripts',
        component: () => import('@/modules/audit/components/views/ScriptsView.vue'),
        meta: {
          title: 'Скрипты - AuditSystem Client',
          breadcrumb: 'Скрипты',
          category: 'scripts',
          requiresPermissions: ['manage_scripts']
        }
      },
      {
        path: 'units',
        name: 'MilitaryUnits',
        component: () => import('@/modules/audit/components/views/military-units/MilitaryUnitsView.vue'),
        meta: {
          title: 'Войсковые части - AuditSystem Client',
          breadcrumb: 'Войсковые части',
          category: 'military_units',
          requiresPermissions: ['view_units']
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/modules/audit/components/views/settings/SettingsView.vue'),
        meta: {
          title: 'Настройки - AuditSystem Client',
          breadcrumb: 'Настройки',
          category: 'settings',
          requiresRoles: ['admin', 'supervisor']
        }
      }
    ]
  }
];

export default auditRoutes;
