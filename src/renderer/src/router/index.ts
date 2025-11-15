import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/batch-input'
  },
  {
    path: '/batch-input',
    name: 'BatchInput',
    component: () => import('../views/BatchInput.vue')
  },
  {
    path: '/video-management',
    name: 'VideoManagement',
    component: () => import('../views/VideoManagement.vue')
  },
  {
    path: '/export',
    name: 'Export',
    component: () => import('../views/Export.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

