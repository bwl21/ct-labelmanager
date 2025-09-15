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
churchtoolsClient.setBaseUrl(baseUrl);

// Development login will be handled in onMounted

const KEY = import.meta.env.VITE_KEY;
export { KEY };

// Initialize the Vue application
const { createApp, ref, reactive, computed, onMounted } = window.Vue;

const app = createApp({
  setup() {
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
        
        // Handle null/undefined values
        if (aVal == null) aVal = '';
        if (bVal == null) bVal = '';
        
        // Convert to string for comparison
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
        const endpoint = `/tags?type=${selectedType.value}`;
        const response = await apiRequest(endpoint);
        
        console.log('Tags response:', response);
        tags.value = response.data || [];
        console.log('Tags assigned:', tags.value.length);
        
        showToast('success', 'Tags Loaded', `Loaded ${tags.value.length} tags successfully.`);
      } catch (error) {
        console.error('Error loading tags:', error);
        tagError.value = 'Failed to load tags. Please try again.';
        showToast('error', 'Load Failed', `Failed to load tags: ${error.message}`);
      } finally {
        isLoadingTags.value = false;
      }
    };

    // Initialize authentication
    onMounted(() => {
      // Use setTimeout to ensure this runs after Vue is fully mounted
      setTimeout(async () => {
        try {
          // Handle development login first
          const devUsername = import.meta.env.VITE_USERNAME;
          const devPassword = import.meta.env.VITE_PASSWORD;
          if (import.meta.env.MODE === 'development' && devUsername && devPassword) {
            try {
              await churchtoolsClient.post('/login', { username: devUsername, password: devPassword });
            } catch (error) {
              console.error('Development login failed:', error);
            }
          }
          
          const user = await churchtoolsClient.get('/whoami');
          
          // Check user data structure
          const hasUser = !!user;
          const hasData = !!user?.data;
          const hasFirstName = !!user?.data?.firstName;
          
          if (hasUser && hasData && hasFirstName) {
            isAuthenticated.value = true;
            currentUser.value = `${user.data.firstName} ${user.data.lastName}`;
            personId.value = user.data.id;
            showToast('success', 'Connected', `Welcome, ${currentUser.value}!`);
            await loadTags();
          } else {
            // Fallback: try to extract data anyway if it exists
            if (user && typeof user === 'object') {
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
      loadTags
    };
  }
});

app.mount('#app');