import { createRouter, createWebHashHistory } from 'vue-router'
import SearchPage from '../Search/Search.vue'

const routes = [
  {
    path: '/',
    name: 'search-page',
    component: SearchPage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
