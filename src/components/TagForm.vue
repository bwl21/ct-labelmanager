<template>
  <div class="ct-card">
    <div class="ct-card-header">
      <h3 class="font-semibold">
        {{ tag ? 'Edit Tag' : 'Create New Tag' }}
      </h3>
    </div>
    
    <form @submit.prevent="handleSubmit" class="ct-card-body space-y-4">
      <div>
        <label for="tagName" class="ct-form-label">Tag Name</label>
        <input
          id="tagName"
          v-model="form.name"
          type="text"
          class="ct-form-control"
          placeholder="Enter tag name"
          required
        />
      </div>
      
      <div>
        <label for="tagColor" class="ct-form-label">Color</label>
        <select
          id="tagColor"
          v-model="form.color"
          class="ct-form-select"
          required
        >
          <option value="">Select a color</option>
          <option
            v-for="color in availableColors"
            :key="color.value"
            :value="color.value"
          >
            {{ color.label }}
          </option>
        </select>
        
        <!-- Color preview -->
        <div v-if="form.color" class="mt-2 flex items-center gap-2">
          <span class="text-sm text-gray-600">Preview:</span>
          <span
            class="inline-block w-6 h-6 rounded border border-gray-300"
            :class="`ct-color-${form.color}`"
          ></span>
          <span class="text-sm font-medium">{{ form.color }}</span>
        </div>
      </div>
      
      <div v-if="error" class="ct-alert ct-alert-danger">
        {{ error }}
      </div>
      
      <div class="flex gap-2 pt-4">
        <button
          type="submit"
          :disabled="isLoading"
          class="ct-btn ct-btn-primary"
        >
          <span v-if="isLoading">Saving...</span>
          <span v-else>{{ tag ? 'Update Tag' : 'Create Tag' }}</span>
        </button>
        
        <button
          type="button"
          @click="$emit('cancel')"
          class="ct-btn ct-btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { Tag } from '../types'

const props = defineProps<{
  tag?: Tag | null
  type: 'persons' | 'songs'
}>()

const emit = defineEmits<{
  save: [tagData: Partial<Tag>]
  cancel: []
}>()

const form = reactive({
  name: '',
  color: ''
})

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

const handleSubmit = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const tagData: Partial<Tag> = {
      name: form.name.trim(),
      color: form.color
    }
    
    if (!tagData.name) {
      throw new Error('Tag name is required')
    }
    
    if (!tagData.color) {
      throw new Error('Tag color is required')
    }
    
    emit('save', tagData)
  } catch (err) {
    console.error('Form validation error:', err)
    error.value = err instanceof Error ? err.message : 'Please check your input'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (props.tag) {
    form.name = props.tag.name
    form.color = props.tag.color
  }
})
</script>