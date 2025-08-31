<template>
  <div class="ct-card">
    <div class="ct-card-body">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="font-medium">{{ selectedCount }} tags selected</span>
          <button
            @click="$emit('clear-selection')"
            class="ct-btn ct-btn-outline-primary ct-btn-sm"
          >
            Clear Selection
          </button>
        </div>
        
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium">Bulk Actions:</span>
          
          <!-- Bulk Color Assignment -->
          <div class="flex items-center gap-1">
            <select
              v-model="selectedColor"
              class="ct-form-select ct-form-select-sm"
              @change="handleColorChange"
            >
              <option value="">Set Color...</option>
              <option
                v-for="color in availableColors"
                :key="color.value"
                :value="color.value"
              >
                {{ color.label }}
              </option>
            </select>
            
            <button
              v-if="selectedColor"
              @click="applyBulkColor"
              :disabled="isLoading"
              class="ct-btn ct-btn-success ct-btn-sm"
            >
              <span v-if="isLoading">Applying...</span>
              <span v-else>Apply Color</span>
            </button>
          </div>
          
          <!-- Bulk Delete -->
          <button
            @click="handleBulkDelete"
            :disabled="isLoading"
            class="ct-btn ct-btn-danger ct-btn-sm"
          >
            <span v-if="isLoading">Deleting...</span>
            <span v-else>Delete Selected</span>
          </button>
        </div>
      </div>
      
      <!-- Color Preview -->
      <div v-if="selectedColor" class="mt-3 flex items-center gap-2">
        <span class="text-sm text-gray-600">Preview color:</span>
        <span
          class="inline-block w-6 h-6 rounded border border-gray-300"
          :class="`ct-color-${selectedColor}`"
        ></span>
        <span class="text-sm font-medium">{{ selectedColor }}</span>
      </div>
      
      <div v-if="error" class="mt-3 ct-alert ct-alert-danger">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  selectedCount: number
}>()

const emit = defineEmits<{
  'bulk-color': [color: string]
  'bulk-delete': []
  'clear-selection': []
}>()

const selectedColor = ref('')
const isLoading = ref(false)
const error = ref('')

const availableColors = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink', label: 'Pink' },
  { value: 'teal', label: 'Teal' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'gray', label: 'Gray' },
  { value: 'dark', label: 'Dark' }
]

const handleColorChange = () => {
  error.value = ''
}

const applyBulkColor = async () => {
  if (!selectedColor.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    emit('bulk-color', selectedColor.value)
    selectedColor.value = ''
  } catch (err) {
    console.error('Bulk color error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to apply color'
  } finally {
    isLoading.value = false
  }
}

const handleBulkDelete = async () => {
  if (!confirm(`Are you sure you want to delete ${props.selectedCount} selected tags? This action cannot be undone.`)) {
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    emit('bulk-delete')
  } catch (err) {
    console.error('Bulk delete error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to delete tags'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.ct-form-select-sm {
  @apply py-1 px-2 text-sm;
}
</style>