<template>
  <div id="app" class="ct-app min-h-screen">
    <!-- ChurchTools-style header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold ct-text-primary">
              ChurchTools Label Manager
            </h1>
          </div>
          <div v-if="isAuthenticated" class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">Authenticated</span>
            <button @click="handleLogout" class="ct-btn ct-btn-outline-primary ct-btn-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <AuthForm v-if="!isAuthenticated" @authenticated="handleAuthenticated" />
      <LabelManager v-else :api="api as any" @logout="handleLogout" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AuthForm from './components/AuthForm.vue'
import LabelManager from './components/LabelManager.vue'
import { ChurchToolsApi } from './services/api'

const isAuthenticated = ref(false)
const api = ref<ChurchToolsApi | null>(null)

const handleAuthenticated = (apiInstance: ChurchToolsApi) => {
  api.value = apiInstance
  isAuthenticated.value = true
}

const handleLogout = () => {
  api.value?.logout()
  api.value = null
  isAuthenticated.value = false
}

onMounted(() => {
  // Check for stored authentication
  const storedToken = localStorage.getItem('ct_login_token')
  const storedPersonId = localStorage.getItem('ct_person_id')
  
  if (storedToken && storedPersonId) {
    const apiInstance = new ChurchToolsApi({
      baseUrl: 'https://testbernhard.church.tools'
    })
    
    apiInstance.setStoredToken(storedToken, parseInt(storedPersonId))
    
    // Verify token is still valid
    apiInstance.verifyAuthentication().then(valid => {
      if (valid) {
        handleAuthenticated(apiInstance)
      }
    }).catch(() => {
      // Token invalid, clear storage
      localStorage.removeItem('ct_login_token')
      localStorage.removeItem('ct_person_id')
    })
  }
})
</script>

<style>
@import './styles/churchtools.css';

#app {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>