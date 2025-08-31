<template>
  <div class="space-y-6">
    <!-- Header with controls -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex items-center gap-4">
        <h2 class="text-xl font-semibold">Label Manager</h2>
        <select v-model="selectedType" class="ct-form-select w-auto">
          <option value="persons">Person Tags</option>
          <option value="songs">Song Tags</option>
        </select>
      </div>
      
      <div class="flex items-center gap-2">
        <button @click="refreshTags" class="ct-btn ct-btn-outline-primary ct-btn-sm">
          Refresh
        </button>
        <button @click="showCreateForm = true" class="ct-btn ct-btn-primary ct-btn-sm">
          Create Tag
        </button>
        <button @click="$emit('logout')" class="ct-btn ct-btn-secondary ct-btn-sm">
          Logout
        </button>
      </div>
    </div>

    <!-- Bulk operations -->
    <BulkOperations
      v-if="selectedTags.length > 0"
      :selected-count="selectedTags.length"
      @bulk-color="handleBulkColor"
      @bulk-delete="handleBulkDelete"
      @clear-selection="clearSelection"
    />

    <!-- Create/Edit Form -->
    <TagForm
      v-if="showCreateForm || editingTag"
      :tag="editingTag"
      :type="selectedType"
      @save="handleSaveTag"
      @cancel="handleCancelEdit"
    />

    <!-- Tags Table -->
    <div class="ct-card">
      <div class="ct-card-header">
        <div class="flex justify-between items-center">
          <h3 class="font-semibold">
            {{ selectedType === 'persons' ? 'Person Tags' : 'Song Tags' }}
            ({{ tags.length }})
          </h3>
          <div class="text-sm text-gray-600">
            {{ selectedTags.length }} selected
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="ct-table">
          <thead>
            <tr>
              <th class="w-12">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                  class="rounded"
                />
              </th>
              <th>Name</th>
              <th>Color</th>
              <th>Count</th>
              <th class="w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tag in tags" :key="tag.id">
              <td>
                <input
                  type="checkbox"
                  :checked="selectedTags.includes(tag.id)"
                  @change="toggleTagSelection(tag.id)"
                  class="rounded"
                />
              </td>
              <td class="font-medium">{{ tag.name }}</td>
              <td>
                <span
                  class="inline-block w-6 h-6 rounded border border-gray-300"
                  :class="`ct-color-${tag.color}`"
                  :title="tag.color"
                ></span>
              </td>
              <td>{{ tag.count || 0 }}</td>
              <td>
                <div class="flex gap-1">
                  <button
                    @click="editTag(tag)"
                    class="ct-btn ct-btn-outline-primary ct-btn-sm"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteTag(tag)"
                    class="ct-btn ct-btn-danger ct-btn-sm"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="tags.length === 0" class="ct-card-body text-center text-gray-500">
          No tags found. Create your first tag to get started.
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="text-gray-600">Loading tags...</div>
    </div>

    <!-- Error display -->
    <div v-if="error" class="ct-alert ct-alert-danger">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ChurchToolsApi } from '../services/api'
import type { Tag } from '../types'
import TagForm from './TagForm.vue'
import BulkOperations from './BulkOperations.vue'

const props = defineProps<{
  api: any
}>()

const emit = defineEmits<{
  logout: []
}>()

const tags = ref<Tag[]>([])
const selectedType = ref<'persons' | 'songs'>('persons')
const selectedTags = ref<number[]>([])
const showCreateForm = ref(false)
const editingTag = ref<Tag | null>(null)
const isLoading = ref(false)
const error = ref('')

const allSelected = computed(() => 
  tags.value.length > 0 && selectedTags.value.length === tags.value.length
)

const loadTags = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const result = await props.api.fetchTags(selectedType.value)
    tags.value = result
  } catch (err) {
    console.error('Error loading tags:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load tags'
  } finally {
    isLoading.value = false
  }
}

const refreshTags = () => {
  selectedTags.value = []
  loadTags()
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedTags.value = []
  } else {
    selectedTags.value = tags.value.map(tag => tag.id)
  }
}

const toggleTagSelection = (tagId: number) => {
  const index = selectedTags.value.indexOf(tagId)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagId)
  }
}

const clearSelection = () => {
  selectedTags.value = []
}

const editTag = (tag: Tag) => {
  editingTag.value = { ...tag }
  showCreateForm.value = false
}

const handleSaveTag = async (tagData: Partial<Tag>) => {
  try {
    if (editingTag.value) {
      // Update existing tag
      await props.api.updateTag(editingTag.value.id, tagData, selectedType.value)
    } else {
      // Create new tag
      await props.api.createTag(tagData as Omit<Tag, 'id'>, selectedType.value)
    }
    
    handleCancelEdit()
    await loadTags()
  } catch (err) {
    console.error('Error saving tag:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save tag'
  }
}

const handleCancelEdit = () => {
  showCreateForm.value = false
  editingTag.value = null
}

const deleteTag = async (tag: Tag) => {
  if (!confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
    return
  }
  
  try {
    await props.api.deleteTag(tag.id, selectedType.value)
    await loadTags()
  } catch (err) {
    console.error('Error deleting tag:', err)
    error.value = err instanceof Error ? err.message : 'Failed to delete tag'
  }
}

const handleBulkColor = async (color: string) => {
  try {
    const promises = selectedTags.value.map(tagId => 
      props.api.updateTag(tagId, { color }, selectedType.value)
    )
    
    await Promise.all(promises)
    clearSelection()
    await loadTags()
  } catch (err) {
    console.error('Error updating tag colors:', err)
    error.value = err instanceof Error ? err.message : 'Failed to update tag colors'
  }
}

const handleBulkDelete = async () => {
  if (!confirm(`Are you sure you want to delete ${selectedTags.value.length} selected tags?`)) {
    return
  }
  
  try {
    const promises = selectedTags.value.map(tagId => 
      props.api.deleteTag(tagId, selectedType.value)
    )
    
    await Promise.all(promises)
    clearSelection()
    await loadTags()
  } catch (err) {
    console.error('Error deleting tags:', err)
    error.value = err instanceof Error ? err.message : 'Failed to delete tags'
  }
}

// Watch for type changes
watch(selectedType, () => {
  selectedTags.value = []
  loadTags()
})

// Load tags on mount
onMounted(() => {
  loadTags()
})
</script>