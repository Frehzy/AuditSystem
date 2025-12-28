// modules/common/composables/useNotFound.ts
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/framework/stores'

export const useNotFound = () => {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  const currentPath = ref(route.path)

  const goToDefault = () => {
    // Логика определения куда перенаправить пользователя
    if (authStore.isAuthenticated) {
      router.push('/audit/monitoring')
    } else {
      router.push('/login')
    }
  }

  return {
    currentPath,
    goToDefault
  }
}
