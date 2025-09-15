// Test if JavaScript is running at all
console.log('🚀 JavaScript is running!');
// Also use alert to bypass console issues (remove after debugging)
// setTimeout(() => alert('JS loaded'), 100);

import type { Person } from './utils/ct-types';
import { churchtoolsClient } from '@churchtools/churchtools-client';

// Only import reset.css in development mode to keep the production bundle small
// and to simulate CT environment
if (import.meta.env.MODE === 'development') {
  import('./utils/reset.css');
}

declare const window: Window & typeof globalThis & {
  settings: {
    base_url?: string;
  };
  Vue: any;
};

const baseUrl = window.settings?.base_url ?? import.meta.env.VITE_BASE_URL;
console.log('Base URL:', baseUrl);
churchtoolsClient.setBaseUrl(baseUrl);

const username = import.meta.env.VITE_USERNAME;
const password = import.meta.env.VITE_PASSWORD;

// Development login will be handled in onMounted

const KEY = import.meta.env.VITE_KEY;
export { KEY };

// Initialize the Vue application
console.log('Loading Vue application...');

// Check if Vue is available
if (!window.Vue) {
  console.error('Vue.js is not loaded!');
  throw new Error('Vue.js is not available');
}

const { createApp, ref, reactive, computed, onMounted } = window.Vue;

const app = createApp({
  setup() {
    console.log('Vue setup() called');
    const isAuthenticated = ref(false);
    const currentUser = ref('');
    const isLoadingTags = ref(false);
    const isSaving = ref(false);
    const tagError = ref('');
    const selectedType = ref('songs');
    const showCreateForm = ref(false);
    const editingTag = ref(null);
    const apiToken = ref('');
    const personId = ref(null);
    const selectedTags = ref([]);
    const prefixFilter = ref('');
    const bulkColor = ref('');
    const isBulkOperating = ref(false);
    const showBulkColorDropdown = ref(false);
    const showTagColorDropdown = ref(false);
    const showColorPicker = ref(false);
    const colorPickerTarget = ref(''); // 'bulk' or 'tag'
    const selectedColorInPicker = ref('');
    const sortField = ref('name');
    const sortDirection = ref('asc');
    const toasts = ref([]);
    const searchFilter = ref('');
    

    
    const tagForm = reactive({
      name: '',
      description: '',
      color: ''
    });
    
    const tags = ref([]);
    
    const allSelected = computed(() => 
      (tags.value?.length || 0) > 0 && (selectedTags.value?.length || 0) === (tags.value?.length || 0)
    );
    
    const sortedTags = computed(() => {
      if (!tags.value || !tags.value.length) return [];
      
      return [...tags.value].sort((a, b) => {
        let aVal = a[sortField.value];
        let bVal = b[sortField.value];
        
        if (aVal == null) aVal = '';
        if (bVal == null) bVal = '';
        
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        
        if (sortDirection.value === 'asc') {
          return aVal.localeCompare(bVal);
        } else {
          return bVal.localeCompare(aVal);
        }
      });
    });

    const filteredTags = computed(() => {
      if (!searchFilter.value) return sortedTags.value;
      
      const filter = searchFilter.value.toLowerCase();
      return sortedTags.value.filter(tag => 
        tag.name.toLowerCase().includes(filter) ||
        (tag.color && tag.color.toLowerCase().includes(filter))
      );
    });
    
    // Color options for tags
    const colorOptions = computed(() => {
      return [
        { value: '', label: 'Select a color', hex: '' },
        { value: 'parent', label: 'Parent', hex: '#6b7280' },
        { value: 'default', label: 'Default', hex: '#6b7280' },
        { value: 'accent', label: 'Accent', hex: '#007cba' },
        { value: 'amber', label: 'Amber', hex: '#f59e0b' },
        { value: 'basic', label: 'Basic', hex: '#6b7280' },
        { value: 'black', label: 'Black', hex: '#000000' },
        { value: 'blue', label: 'Blue', hex: '#3b82f6' },
        { value: 'critical', label: 'Critical', hex: '#dc2626' },
        { value: 'constructive', label: 'Constructive', hex: '#16a34a' },
        { value: 'destructive', label: 'Destructive', hex: '#dc2626' },
        { value: 'cyan', label: 'Cyan', hex: '#06b6d4' },
        { value: 'danger', label: 'Danger', hex: '#dc2626' },
        { value: 'emerald', label: 'Emerald', hex: '#10b981' },
        { value: 'error', label: 'Error', hex: '#dc2626' },
        { value: 'fuchsia', label: 'Fuchsia', hex: '#d946ef' },
        { value: 'gray', label: 'Gray', hex: '#6b7280' },
        { value: 'green', label: 'Green', hex: '#16a34a' },
        { value: 'indigo', label: 'Indigo', hex: '#6366f1' },
        { value: 'info', label: 'Info', hex: '#3b82f6' },
        { value: 'lime', label: 'Lime', hex: '#84cc16' },
        { value: 'magic', label: 'Magic', hex: '#8b5cf6' },
        { value: 'orange', label: 'Orange', hex: '#f97316' },
        { value: 'pink', label: 'Pink', hex: '#ec4899' },
        { value: 'purple', label: 'Purple', hex: '#a855f7' },
        { value: 'red', label: 'Red', hex: '#dc2626' },
        { value: 'rose', label: 'Rose', hex: '#f43f5e' },
        { value: 'sky', label: 'Sky', hex: '#0ea5e9' },
        { value: 'success', label: 'Success', hex: '#16a34a' },
        { value: 'teal', label: 'Teal', hex: '#14b8a6' },
        { value: 'violet', label: 'Violet', hex: '#8b5cf6' },
        { value: 'warning', label: 'Warning', hex: '#f59e0b' },
        { value: 'white', label: 'White', hex: '#ffffff' },
        { value: 'yellow', label: 'Yellow', hex: '#eab308' }
      ];
    });

    // Toast Functions
    const showToast = (type: string, title: string, message: string, duration = 5000) => {
      const id = Date.now() + Math.random();
      const toast = { id, type, title, message, removing: false };
      toasts.value.push(toast);
      
      setTimeout(() => {
        removeToast(id);
      }, duration);
    };
    
    const removeToast = (id: number) => {
      const toast = toasts.value.find(t => t.id === id);
      if (toast) {
        toast.removing = true;
        setTimeout(() => {
          const index = toasts.value.findIndex(t => t.id === id);
          if (index > -1) {
            toasts.value.splice(index, 1);
          }
        }, 300);
      }
    };

    // API Helper Functions using ChurchTools client
    const apiRequest = async (endpoint: string, options: any = {}) => {
      try {
        if (options.method === 'POST') {
          return await churchtoolsClient.post(endpoint, options.body);
        } else if (options.method === 'PUT') {
          return await churchtoolsClient.put(endpoint, options.body);
        } else if (options.method === 'DELETE') {
          return await churchtoolsClient.delete(endpoint);
        } else {
          return await churchtoolsClient.get(endpoint);
        }
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    };

    const logout = () => {
      // In ChurchTools environment, logout is handled by ChurchTools itself
      showToast('info', 'Logout', 'Please use ChurchTools logout functionality.');
    };

    // Tag management functions
    const loadTags = async () => {
      if (!isAuthenticated.value) return;

      isLoadingTags.value = true;
      tagError.value = '';

      try {
        console.log('Loading tags...');
        
        // Use the correct ChurchTools tags endpoint with type parameter
        const endpoint = `/tags?type=${selectedType.value}`;
        console.log('Endpoint:', endpoint);
        
        const response = await apiRequest(endpoint);
        console.log('API Response:', response);
        
        if (response && response.data && Array.isArray(response.data)) {
          tags.value = response.data;
          console.log('Tags set to:', tags.value.length, 'items');
          showToast('success', 'Tags Loaded', `Loaded ${tags.value.length} tags successfully.`);
        } else {
          console.error('Invalid response structure:', response);
          tags.value = [];
          showToast('error', 'Load Failed', 'Invalid response from server');
        }
      } catch (error) {
        console.error('Error loading tags:', error);
        tagError.value = 'Failed to load tags. Please try again.';
        showToast('error', 'Load Failed', `Failed to load tags: ${error.message}`);
      } finally {
        isLoadingTags.value = false;
      }
    };

    // Selection functions
    const selectAll = () => {
      selectedTags.value = filteredTags.value.map(tag => tag.id);
    };

    const clearSelection = () => {
      selectedTags.value = [];
    };

    const toggleSelectAll = () => {
      if (allSelected.value) {
        clearSelection();
      } else {
        selectAll();
      }
    };

    const selectByPrefix = () => {
      if (!prefixFilter.value) return;
      
      const pattern = prefixFilter.value.replace('*', '.*');
      const regex = new RegExp(pattern, 'i');
      
      selectedTags.value = filteredTags.value
        .filter(tag => regex.test(tag.name))
        .map(tag => tag.id);
    };

    // Bulk operations
    const applyBulkColor = async () => {
      if (!bulkColor.value || selectedTags.value.length === 0) {
        showToast('warning', 'No Selection', 'Please select tags and a color first');
        return;
      }
      
      isBulkOperating.value = true;
      try {
        let successCount = 0;
        let errorCount = 0;
        
        for (const tagId of selectedTags.value) {
          try {
            await apiRequest(`/tags/${tagId}?type=${selectedType.value}`, {
              method: 'PUT',
              body: { color: bulkColor.value }
            });
            successCount++;
          } catch (error) {
            console.error(`Failed to update tag ${tagId}:`, error);
            errorCount++;
          }
        }
        
        if (successCount > 0) {
          showToast('success', 'Bulk Update', `Updated ${successCount} tags with ${bulkColor.value} color`);
          await loadTags();
        }
        
        if (errorCount > 0) {
          showToast('warning', 'Partial Success', `${errorCount} tags failed to update`);
        }
        
        clearSelection();
        bulkColor.value = '';
      } catch (error) {
        console.error('Bulk color update failed:', error);
        showToast('error', 'Bulk Update Failed', error.message);
      } finally {
        isBulkOperating.value = false;
      }
    };

    const deleteBulkTags = async () => {
      if (selectedTags.value.length === 0) return;
      
      if (!confirm(`Are you sure you want to delete ${selectedTags.value.length} tags? This cannot be undone.`)) {
        return;
      }
      
      isBulkOperating.value = true;
      try {
        const promises = selectedTags.value.map(tagId => 
          apiRequest(`/tags/${tagId}?type=${selectedType.value}`, {
            method: 'DELETE'
          })
        );
        
        await Promise.all(promises);
        showToast('success', 'Bulk Delete', `Deleted ${selectedTags.value.length} tags`);
        await loadTags();
        clearSelection();
      } catch (error) {
        console.error('Bulk delete failed:', error);
        showToast('error', 'Bulk Delete Failed', error.message);
      } finally {
        isBulkOperating.value = false;
      }
    };

    // Tag operations
    const editTag = (tag) => {
      editingTag.value = tag;
      tagForm.name = tag.name;
      tagForm.description = tag.description || '';
      tagForm.color = tag.color || '';
      showCreateForm.value = true;
    };

    const deleteTag = async (tag) => {
      if (!confirm(`Are you sure you want to delete "${tag.name}"? This cannot be undone.`)) {
        return;
      }
      
      try {
        await apiRequest(`/tags/${tag.id}?type=${selectedType.value}`, {
          method: 'DELETE'
        });
        showToast('success', 'Tag Deleted', `"${tag.name}" has been deleted`);
        await loadTags();
      } catch (error) {
        console.error('Delete failed:', error);
        showToast('error', 'Delete Failed', error.message);
      }
    };

    // Sorting
    const toggleSortDirection = () => {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    };

    // Modal functions
    const cancelEdit = () => {
      showCreateForm.value = false;
      editingTag.value = null;
      tagForm.name = '';
      tagForm.description = '';
      tagForm.color = '';
      tagError.value = '';
    };

    const saveTag = async () => {
      if (!tagForm.name.trim()) {
        tagError.value = 'Tag name is required';
        return;
      }

      isSaving.value = true;
      tagError.value = '';

      try {
        if (editingTag.value) {
          // Update existing tag
          await apiRequest(`/tags/${editingTag.value.id}?type=${selectedType.value}`, {
            method: 'PUT',
            body: {
              name: tagForm.name.trim(),
              description: tagForm.description.trim() || null,
              color: tagForm.color || null
            }
          });
          showToast('success', 'Tag Updated', `"${tagForm.name}" has been updated`);
        } else {
          // Create new tag
          await apiRequest(`/tags?type=${selectedType.value}`, {
            method: 'POST',
            body: {
              name: tagForm.name.trim(),
              description: tagForm.description.trim() || null,
              color: tagForm.color || null
            }
          });
          showToast('success', 'Tag Created', `"${tagForm.name}" has been created`);
        }
        
        await loadTags();
        cancelEdit();
      } catch (error) {
        console.error('Save tag failed:', error);
        tagError.value = error.message || 'Failed to save tag';
        showToast('error', 'Save Failed', error.message);
      } finally {
        isSaving.value = false;
      }
    };

    // Initialize authentication
    onMounted(() => {
      console.log('Vue app mounted, starting authentication...');
      
      // Use setTimeout to ensure this runs after Vue is fully mounted
      setTimeout(async () => {
        console.log('=== AUTHENTICATION START ===');

        try {
          // Handle development login first
          const devUsername = import.meta.env.VITE_USERNAME;
          const devPassword = import.meta.env.VITE_PASSWORD;
          if (import.meta.env.MODE === 'development' && devUsername && devPassword) {
            console.log('Development mode: attempting login with credentials');
            try {
              await churchtoolsClient.post('/login', { username: devUsername, password: devPassword });
              console.log('Development login successful');
            } catch (error) {
              console.error('Development login failed:', error);
            }
          }
          
          console.log('Attempting authentication...');
          console.log('Current mode:', import.meta.env.MODE);
          console.log('Base URL:', baseUrl);
          console.log('About to call /whoami...');
          
          const user = await churchtoolsClient.get('/whoami');
          console.log('Whoami response:', user);
          console.log('User exists:', !!user);
          console.log('User.data exists:', !!user?.data);
          console.log('User.data.firstName exists:', !!user?.data?.firstName);
          
          // Check user data structure
          const hasUser = !!user;
          const hasData = !!user?.data;
          const hasFirstName = !!user?.data?.firstName;
          
          if (hasUser && hasData && hasFirstName) {
            isAuthenticated.value = true;
            currentUser.value = `${user.data.firstName} ${user.data.lastName}`;
            personId.value = user.data.id;
            console.log('Authentication successful:', currentUser.value);
            showToast('success', 'Connected', `Welcome, ${currentUser.value}!`);
            await loadTags();
          } else {
            console.log('Authentication failed - missing data');
            console.log('Condition results: hasUser=', hasUser, 'hasData=', hasData, 'hasFirstName=', hasFirstName);
            
            // Fallback: try to extract data anyway if it exists
            if (user && typeof user === 'object') {
              console.log('Attempting fallback authentication...');
              try {
                // Try different possible structures
                let firstName, lastName, userId;
                
                if (user.data) {
                  firstName = user.data.firstName;
                  lastName = user.data.lastName;
                  userId = user.data.id;
                } else if (user.firstName) {
                  firstName = user.firstName;
                  lastName = user.lastName;
                  userId = user.id;
                }
                
                if (firstName) {
                  isAuthenticated.value = true;
                  currentUser.value = `${firstName} ${lastName || ''}`.trim();
                  personId.value = userId;
                  console.log('Fallback authentication successful:', currentUser.value);
                  showToast('success', 'Connected', `Welcome, ${currentUser.value}!`);
                  await loadTags();
                } else {
                  showToast('error', 'Authentication Failed', 'Could not extract user data');
                }
              } catch (fallbackError) {
                console.error('Fallback authentication failed:', fallbackError);
                showToast('error', 'Authentication Failed', 'User data structure issue');
              }
            } else {
              showToast('error', 'Authentication Failed', 'No user object received');
            }
          }
        } catch (error) {
          console.error('Authentication failed:', error);
          console.error('Error details:', error.message, error.stack);
          showToast('error', 'Authentication Failed', `Error: ${error.message || 'Unknown error'}`);
        }
      }, 100);
    });

    return {
      // State
      isAuthenticated,
      currentUser,
      isLoadingTags,
      isSaving,
      tagError,
      selectedType,
      showCreateForm,
      editingTag,
      selectedTags,
      prefixFilter,
      bulkColor,
      isBulkOperating,
      showBulkColorDropdown,
      showTagColorDropdown,
      showColorPicker,
      colorPickerTarget,
      selectedColorInPicker,
      sortField,
      sortDirection,
      toasts,
      tagForm,
      tags,
      searchFilter,
      
      // Computed
      allSelected,
      sortedTags,
      filteredTags,
      colorOptions,
      
      // Methods
      showToast,
      removeToast,
      logout,
      loadTags,
      selectAll,
      clearSelection,
      toggleSelectAll,
      selectByPrefix,
      applyBulkColor,
      deleteBulkTags,
      editTag,
      deleteTag,
      toggleSortDirection,
      cancelEdit,
      saveTag
    };
  }
});

console.log('Mounting Vue app to #app...');

// Check if #app element exists
const appElement = document.getElementById('app');
if (!appElement) {
  console.error('#app element not found!');
  throw new Error('#app element not found');
}

try {
  app.mount('#app');
  console.log('Vue app mounted successfully');
} catch (error) {
  console.error('Failed to mount Vue app:', error);
  throw error;
}