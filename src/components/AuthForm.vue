<template>
  <div class="max-w-md mx-auto">
    <div class="ct-card">
      <div class="ct-card-header">
        <h2 class="text-lg font-semibold">Login to ChurchTools</h2>
        <p class="text-sm text-gray-600 mt-1">
          Enter your ChurchTools credentials to manage labels
        </p>
      </div>
      
      <form @submit.prevent="handleLogin" class="ct-card-body space-y-4">
      <div>
        <label for="baseUrl" class="ct-form-label">ChurchTools URL</label>
        <input
          id="baseUrl"
          v-model="form.baseUrl"
          type="url"
          class="ct-form-control"
          placeholder="https://your-church.church.tools"
          required
        />
        <p class="text-xs text-gray-500 mt-1">
          The URL of your ChurchTools instance
        </p>
      </div>
      
      <div>
        <label for="username" class="ct-form-label">Username</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          class="ct-form-control"
          placeholder="Your username"
          required
        />
      </div>
      
      <div>
        <label for="password" class="ct-form-label">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="ct-form-control"
          placeholder="Your password"
          required
        />
      </div>
      
      <div v-if="error" class="ct-alert ct-alert-danger">
        <strong>Error:</strong> {{ error }}
      </div>
      
      <div v-if="status" class="ct-alert ct-alert-info">
        {{ status }}
      </div>
      
      <button
        type="submit"
        :disabled="isLoading"
        class="ct-btn ct-btn-primary w-full ct-btn-lg"
      >
        <span v-if="isLoading" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Logging in...
        </span>
        <span v-else>Login to ChurchTools</span>
      </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ChurchToolsApi } from '../services/api'

const emit = defineEmits<{
  authenticated: [api: ChurchToolsApi]
}>()

const form = reactive({
  baseUrl: 'https://testbernhard.church.tools',
  username: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')
const status = ref('')

const handleLogin = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''
  status.value = 'Connecting to ChurchTools...'
  
  try {
    const api = new ChurchToolsApi({
      baseUrl: form.baseUrl
    })
    
    status.value = 'Authenticating...'
    const success = await api.authenticate(form.username, form.password)
    
    if (success) {
      status.value = 'Login successful!'
      emit('authenticated', api)
    } else {
      error.value = 'Authentication failed. Please check your credentials.'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = err instanceof Error ? err.message : 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
    status.value = ''
  }
}
</script>