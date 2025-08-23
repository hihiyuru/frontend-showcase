import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/skill-tree-demo',
    name: 'SkillTreeDemo',
    component: () => import('@/views/SkillTreeDemo.vue'),
  },
  {
    path: '/dropdown',
    name: 'Dropdown',
    component: () => import('@/views/Dropdown.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
