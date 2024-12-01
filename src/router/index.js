import { createRouter, createWebHashHistory } from 'vue-router'
import SearchPage from '../Search/Search_old.vue'
import SearchResult from '../Search/Search_result.vue'
import AllTokens from '../Search/Search_all.vue'

const routes = [
  {
    path: '/',
    name: 'search-page',
    component: SearchPage
  },
  {
    path: '/result',
    name: 'search-result',
    component: SearchResult
  },
  {
    path: '/all-tokens',
    name: 'all-tokens',
    component: AllTokens
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
