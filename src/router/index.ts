import { createRouter, createWebHashHistory } from 'vue-router'
import ListView from '@/views/ListView.vue'
import DesignSystemView from '@/views/DesignSystemView.vue'
import DesignSystemSView from '@/views/DesignSystemSView.vue'
import DesignSystemAView from '@/views/DesignSystemAView.vue'
import AppMainView from '@/views/app/AppMainView.vue'
import AppAllBooksView from '@/views/app/AppAllBooksView.vue'
import AppBookSeriesView from '@/views/app/AppBookSeriesView.vue'
import AppBookDetailView from '@/views/app/AppBookDetailView.vue'
import AppAwardsView from '@/views/app/AppAwardsView.vue'
import AppProfileView from '@/views/app/AppProfileView.vue'
import useUser, { isWeb } from '@/use/useUser'

const routes = [
  { path: '/', name: 'main-menu', component: ListView, redirect: '/app' },
  { path: '/design-system', name: 'design-system', component: DesignSystemView },
  { path: '/design-system-s', name: 'design-system-s', component: DesignSystemSView },
  { path: '/design-system-a', name: 'design-system-a', component: DesignSystemAView },
  { path: '/app', name: 'app-main', component: AppMainView },
  { path: '/app/all-books', name: 'app-all-books', component: AppAllBooksView },
  { path: '/app/series/:seriesId', name: 'app-series', component: AppBookSeriesView },
  { path: '/app/book/:bookId', name: 'app-book', component: AppBookDetailView },
  { path: '/app/awards', name: 'app-awards', component: AppAwardsView },
  { path: '/app/profile', name: 'app-profile', component: AppProfileView }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

const remoteURL = import.meta.env.VITE_APP_REMOTE_URL
// --- THE ROUTER HOOK ---
router.beforeEach((to, from) => {
  const { userUnlocked, setSettingValue } = useUser()

  const url = window.location.href
  const storedUnlock: string = (localStorage.getItem('full_unlocked') as string)
  const parsedStoredUnlock: boolean = typeof storedUnlock === 'string' && storedUnlock?.length ? (JSON.parse(storedUnlock) as boolean) : false
  const isUnlocked = to.query.unlock === 'true' || to.query.unlocked === 'true' || from.query.unlocked === 'true' || parsedStoredUnlock === true

  // Only apply restrictions if it's the Web version
  if (isWeb) {
    const isFullVersion = url.includes(remoteURL + '/little-bible-stories/') && !url.includes('/little-bible-stories/demo/') && !url.includes('/little-bible-stories/develop/')
    const isDevelopVersion = url.includes(remoteURL + '/little-bible-stories/develop/')
    const isDev = url.includes('localhost:5173/')

    if (isDev) {
      return true
    }

    // If user is on Full or Develop without the unlock param, boot them to Demo
    if ((isFullVersion || isDevelopVersion) && !isUnlocked) {
      window.location.href = remoteURL + '/little-bible-stories/demo/'
      return false// Stop execution
    } else if (isUnlocked && (isFullVersion || isDevelopVersion)) {
      localStorage.setItem('full_unlocked', 'true')
    }
  }

  return true
})

export default router