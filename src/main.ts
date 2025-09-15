import {computed, createApp, onMounted, reactive, ref} from 'vue';
import {compile} from '@vue/compiler-dom';

console.log('Starting app initialization...');

// TypeScript interfaces
interface Tag {
    id: number;
    name: string;
    description?: string;
    color: string;
}

interface Toast {
    id: number;
    type: string;
    title: string;
    message: string;
    removing: boolean;
}



interface LoginForm {
    baseUrl: string;
    username: string;
    password: string;
}

interface TagForm {
    name: string;
    description: string;
    color: string;
}

interface ApiRequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
}

interface HSL {
    h: number;
    s: number;
    l: number;
}

// Make the compiler available globally for runtime template compilation
window.Vue = {compile};

const app = createApp({
    setup() {
        const isAuthenticated = ref(false);
        const currentUser = ref('');
        const isLoading = ref(false);
        const isLoadingTags = ref(false);
        const isSaving = ref(false);
        const loginError = ref('');
        const loginStatus = ref('');
        const tagError = ref('');
        const selectedType = ref('person');
        const showCreateForm = ref(false);
        const editingTag = ref<Tag | null>(null);
        const apiToken = ref('');
        const personId = ref<number | null>(null);
        const selectedTags = ref<number[]>([]);
        const prefixFilter = ref('');
        const bulkColor = ref('');
        const isBulkOperating = ref(false);
        const showBulkColorDropdown = ref(false);
        const showTagColorDropdown = ref(false);
        const showColorPicker = ref(false);
        const colorPickerTarget = ref<'bulk' | 'tag' | ''>(''); // 'bulk' or 'tag'
        const selectedColorInPicker = ref('');
        const sortField = ref<'name' | 'description' | 'color'>('name');
        const sortDirection = ref<'asc' | 'desc'>('asc');
        const toasts = ref<Toast[]>([]);


        


        const loginForm = reactive<LoginForm>({
            baseUrl: 'https://testbernhard.church.tools',
            username: '',
            password: ''
        });

        const tagForm = reactive<TagForm>({
            name: '',
            description: '',
            color: ''
        });

        const tags = ref<Tag[]>([]);

        const allSelected = computed(() =>
            tags.value.length > 0 && selectedTags.value.length === tags.value.length
        );

        const sortedTags = computed(() => {
            if (!tags.value.length) return [];

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

        // Computed property for color options
        const colorOptions = computed(() => {
            return [
                {value: '', label: 'Select a color', hex: ''},
                {value: 'parent', label: 'Parent', hex: '#6b7280'},
                {value: 'default', label: 'Default', hex: '#6b7280'},
                {value: 'accent', label: 'Accent', hex: '#007cba'},
                {value: 'amber', label: 'Amber', hex: '#f59e0b'},
                {value: 'basic', label: 'Basic', hex: '#6b7280'},
                {value: 'black', label: 'Black', hex: '#000000'},
                {value: 'blue', label: 'Blue', hex: '#3b82f6'},
                {value: 'critical', label: 'Critical', hex: '#dc2626'},
                {value: 'constructive', label: 'Constructive', hex: '#16a34a'},
                {value: 'destructive', label: 'Destructive', hex: '#dc2626'},
                {value: 'cyan', label: 'Cyan', hex: '#06b6d4'},
                {value: 'danger', label: 'Danger', hex: '#dc2626'},
                {value: 'emerald', label: 'Emerald', hex: '#10b981'},
                {value: 'error', label: 'Error', hex: '#dc2626'},
                {value: 'fuchsia', label: 'Fuchsia', hex: '#d946ef'},
                {value: 'gray', label: 'Gray', hex: '#6b7280'},
                {value: 'green', label: 'Green', hex: '#16a34a'},
                {value: 'indigo', label: 'Indigo', hex: '#6366f1'},
                {value: 'info', label: 'Info', hex: '#3b82f6'},
                {value: 'lime', label: 'Lime', hex: '#84cc16'},
                {value: 'magic', label: 'Magic', hex: '#8b5cf6'},
                {value: 'orange', label: 'Orange', hex: '#f97316'},
                {value: 'pink', label: 'Pink', hex: '#ec4899'},
                {value: 'purple', label: 'Purple', hex: '#a855f7'},
                {value: 'red', label: 'Red', hex: '#dc2626'},
                {value: 'rose', label: 'Rose', hex: '#f43f5e'},
                {value: 'sky', label: 'Sky', hex: '#0ea5e9'},
                {value: 'success', label: 'Success', hex: '#16a34a'},
                {value: 'teal', label: 'Teal', hex: '#14b8a6'},
                {value: 'violet', label: 'Violet', hex: '#8b5cf6'},
                {value: 'warning', label: 'Warning', hex: '#f59e0b'},
                {value: 'white', label: 'White', hex: '#ffffff'},
                {value: 'yellow', label: 'Yellow', hex: '#eab308'}
            ];
        });

        // Computed property for sorted colors by similarity
        const sortedColorOptions = computed(() => {
            const colors = colorOptions.value.filter(c => c.value !== '');

            // Sort colors by category and hue
            return colors.sort((a, b) => {
                const categoryA = getColorCategory(a.value);
                const categoryB = getColorCategory(b.value);

                // First sort by category
                if (categoryA !== categoryB) {
                    return categoryA - categoryB;
                }

                // Within same category, sort by hue
                const hslA = hexToHsl(a.hex);
                const hslB = hexToHsl(b.hex);

                // For grayscale colors, sort by lightness
                if (categoryA === 1) {
                    return hslA.l - hslB.l;
                }

                // For colored items, sort by hue, then saturation, then lightness
                if (Math.abs(hslA.h - hslB.h) > 5) {
                    return hslA.h - hslB.h;
                }
                if (Math.abs(hslA.s - hslB.s) > 10) {
                    return hslB.s - hslA.s; // Higher saturation first
                }
                return hslA.l - hslB.l;
            });
        });

        // Toast Functions
        const showToast = (type: string, title: string, message: string, duration = 5000) => {
            const id = Date.now() + Math.random();
            const toast: Toast = {id, type, title, message, removing: false};
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
                }, 300); // Match animation duration
            }
        };

        // API Helper Functions
        const apiRequest = async (endpoint: string, options: ApiRequestOptions = {}) => {
            const url = `${loginForm.baseUrl}/api${endpoint}`;
            const headers: Record<string, string> = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...options.headers
            };

            if (apiToken.value) {
                headers['Authorization'] = `Login ${apiToken.value}`;
            }

            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include'
            });

            const responseText = await response.text();
            let data;

            // Check for PHP warnings in response
            const hasPhpWarnings = responseText.includes('<b>Warning</b>') || responseText.includes('<b>Notice</b>');

            try {
                if (hasPhpWarnings) {
                    // Extract JSON from response with PHP warnings
                    const jsonMatch = responseText.match(/\{[\s\S]*\}$/);
                    if (jsonMatch) {
                        data = JSON.parse(jsonMatch[0]);
                        // Log the warnings for debugging
                        console.warn('ChurchTools PHP Warnings detected:', responseText.split('{')[0]);

                        // Show a warning toast about backend issues
                        if (response.ok && data.data) {
                            showToast('warning', 'Backend Warning', 'The operation completed successfully, but there were backend warnings. Please check the browser console for details.');
                        }
                    } else {
                        throw new Error('Could not parse response with PHP warnings');
                    }
                } else if (response.status === 204) {
                    data = {"message": "deleted"}

                } else if (response.ok) {
                    data = JSON.parse(responseText);
                }
            } catch (e) {
                console.error('Invalid JSON response:', responseText);
                throw new Error('Invalid response from server');
            }

            if (!response.ok) {
                const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
                console.error('API Error:', data);
                throw new Error(errorMessage);
            }

            return data;
        };

        const login = async () => {
            if (!loginForm.username || !loginForm.password) {
                loginError.value = 'Please enter username and password';
                return;
            }

            isLoading.value = true;
            loginError.value = '';
            loginStatus.value = 'Connecting to ChurchTools...';

            try {
                // Step 1: Login with credentials
                loginStatus.value = 'Authenticating...';
                const loginResponse = await fetch(`${loginForm.baseUrl}/api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        username: loginForm.username,
                        password: loginForm.password
                    })
                });

                if (!loginResponse.ok) {
                    const errorData = await loginResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || `Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
                }

                const loginData = await loginResponse.json();
                console.log('Login response:', loginData);

                // Get person ID from response
                const pId = loginData.data?.personId || loginData.personId;
                if (!pId) {
                    console.error('No person ID in login response:', loginData);
                    throw new Error('Could not get person ID from login');
                }

                personId.value = pId;
                console.log('Login successful, person ID:', pId);

                // Step 2: Request login token
                loginStatus.value = 'Getting authentication token...';
                const tokenResponse = await fetch(`${loginForm.baseUrl}/api/persons/${pId}/logintoken`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    credentials: 'include'
                });

                if (!tokenResponse.ok) {
                    throw new Error(`Failed to get login token: ${tokenResponse.status} ${tokenResponse.statusText}`);
                }

                const tokenData = await tokenResponse.json();
                console.log('Token response:', tokenData);

                let token = null;
                if (tokenData.data && typeof tokenData.data === 'string') {
                    token = tokenData.data;
                } else if (tokenData.token) {
                    token = tokenData.token;
                }

                if (!token) {
                    console.error('No token in response:', tokenData);
                    throw new Error('No login token received');
                }

                // Store token and authenticate
                apiToken.value = token;
                currentUser.value = loginForm.username;
                isAuthenticated.value = true;

                // Store in localStorage for persistence
                localStorage.setItem('ct_login_token', token);
                localStorage.setItem('ct_person_id', pId.toString());
                localStorage.setItem('ct_base_url', loginForm.baseUrl);
                localStorage.setItem('ct_username', loginForm.username);

                console.log('Authentication successful, login token received and stored');

                // Load initial tags
                await loadTags();

            } catch (error) {
                console.error('Authentication error:', error);
                loginError.value = (error as Error).message;

                // Check for CORS or network issues
                if (error instanceof TypeError && (error as Error).message.includes('fetch')) {
                    loginError.value = 'Network error: Cannot connect to ChurchTools. Please check the URL and your internet connection.';
                }
            } finally {
                isLoading.value = false;
                loginStatus.value = '';
            }
        };

        const logout = async () => {
            try {
                if (apiToken.value && personId.value) {
                    // Try to revoke the token on the server
                    await fetch(`${loginForm.baseUrl}/api/persons/${personId.value}/logintoken`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Login ${apiToken.value}`,
                            'Accept': 'application/json',
                        },
                        credentials: 'include'
                    });
                }
            } catch (error) {
                console.error('Error revoking token:', error);
            } finally {
                // Always clear local state
                isAuthenticated.value = false;
                currentUser.value = '';
                apiToken.value = '';
                personId.value = null;
                tags.value = [];
                loginForm.username = '';
                loginForm.password = '';

                // Clear localStorage
                localStorage.removeItem('ct_login_token');
                localStorage.removeItem('ct_person_id');
                localStorage.removeItem('ct_base_url');
                localStorage.removeItem('ct_username');
            }
        };

        const loadTags = async () => {
            if (!isAuthenticated.value) return;

            isLoadingTags.value = true;
            selectedTags.value = []; // Clear selection when loading new tags
            try {
                const response = await apiRequest(`/tags/${selectedType.value}`);
                tags.value = response.data || [];
                console.log('Tags loaded:', tags.value);
            } catch (error) {
                console.error('Error loading tags:', error);
                loginError.value = `Failed to load tags: ${(error as Error).message}`;
            } finally {
                isLoadingTags.value = false;
            }
        };

        const editTag = (tag: Tag) => {
            editingTag.value = tag;
            tagForm.name = tag.name;
            tagForm.description = tag.description || '';
            tagForm.color = tag.color || '';
            showCreateForm.value = false;
        };

        const saveTag = async () => {
            const trimmedName = tagForm.name.trim();

            if (!trimmedName) {
                tagError.value = 'Tag name is required';
                showToast('warning', 'Missing Name', 'Tag name is required');
                return;
            }

            if (trimmedName.length > 100) {
                tagError.value = 'Tag name must be between 1 and 100 characters';
                showToast('warning', 'Name Too Long', 'Tag name must be between 1 and 100 characters');
                return;
            }

            if (!tagForm.color) {
                tagError.value = 'Tag color is required';
                showToast('warning', 'Missing Color', 'Tag color is required');
                return;
            }

            // Check for duplicate names (case-insensitive)
            const existingTag = tags.value.find(tag =>
                tag.name.toLowerCase() === trimmedName.toLowerCase() &&
                (!editingTag.value || tag.id !== editingTag.value.id)
            );

            if (existingTag) {
                tagError.value = `A tag with the name "${trimmedName}" already exists`;
                showToast('warning', 'Duplicate Name', `A tag with the name "${trimmedName}" already exists. Please choose a different name.`);
                return;
            }

            isSaving.value = true;
            tagError.value = '';

            try {
                const tagData = {
                    name: trimmedName,
                    description: tagForm.description.trim() || '',
                    color: tagForm.color
                };

                if (editingTag.value) {
                    // Update existing tag using PUT method
                    await apiRequest(`/tags/${editingTag.value.id}`, {
                        method: 'PUT',
                        body: JSON.stringify(tagData)
                    });
                } else {
                    // Create new tag
                    await apiRequest(`/tags/${selectedType.value}`, {
                        method: 'POST',
                        body: JSON.stringify(tagData)
                    });
                }

                showToast('success',
                    editingTag.value ? 'Tag Updated' : 'Tag Created',
                    `Tag "${trimmedName}" was ${editingTag.value ? 'updated' : 'created'} successfully.`
                );
                cancelEdit();
                await loadTags();
            } catch (error) {
                console.error('Error saving tag:', error);

                let errorMessage = (error as Error).message;
                let errorTitle = editingTag.value ? 'Update Failed' : 'Create Failed';

                // Handle duplicate entry errors
                if ((error as Error).message.includes('Duplicate entry') || (error as Error).message.includes('1062')) {
                    errorTitle = 'Duplicate Tag';
                    errorMessage = `A tag with the name "${tagForm.name.trim()}" already exists. Please choose a different name.`;
                }
                // Handle validation errors from ChurchTools
                else if ((error as Error).message.includes('validation')) {
                    try {
                        const errorData = JSON.parse((error as Error).message.split('HTTP 400: ')[1] || '{}');
                        if (errorData.errors && errorData.errors.length > 0) {
                            const fieldErrors = errorData.errors.map((err: any) => `${err.fieldId}: ${err.message}`).join(', ');
                            errorMessage = `Validation error: ${fieldErrors}`;
                        } else {
                            errorMessage = errorData.translatedMessage || (error as Error).message;
                        }
                    } catch (parseError) {
                        errorMessage = (error as Error).message;
                    }
                }
                // Handle server errors with HTML warnings
                else if ((error as Error).message.includes('<b>Warning</b>') || (error as Error).message.includes('server.error')) {
                    try {
                        // Extract JSON from HTML response
                        const jsonMatch = (error as Error).message.match(/\{[\s\S]*\}$/);
                        if (jsonMatch) {
                            const errorData = JSON.parse(jsonMatch[0]);
                            if (errorData.errors && errorData.errors.length > 0) {
                                const dbError = errorData.errors[0].message;
                                if (dbError.includes('Duplicate entry')) {
                                    errorTitle = 'Duplicate Tag';
                                    errorMessage = `A tag with the name "${tagForm.name.trim()}" already exists. Please choose a different name.`;
                                } else {
                                    errorMessage = dbError;
                                }
                            } else {
                                errorMessage = errorData.translatedMessage || 'A server error occurred';
                            }
                        }
                    } catch (parseError) {
                        errorMessage = 'A server error occurred. Please try again.';
                    }
                }

                showToast('error', errorTitle, errorMessage);
                tagError.value = errorMessage;
            } finally {
                isSaving.value = false;
            }
        };

        const cancelEdit = () => {
            showCreateForm.value = false;
            editingTag.value = null;
            tagForm.name = '';
            tagForm.description = '';
            tagForm.color = '';
            tagError.value = '';
        };



        const deleteTag = (tag: Tag) => {
            showDeleteConfirmation(
                'Delete Tag',
                `Are you sure you want to delete "${tag.name}"?\n\nThis action cannot be undone.`,
                async () => {
                    try {
                        await apiRequest(`/tags/${tag.id}`, {
                            method: 'DELETE'
                        });
                        showToast('success', 'Tag Deleted', `Tag "${tag.name}" was deleted successfully.`);
                        await loadTags();
                    } catch (error) {
                        console.error('Error deleting tag:', error);
                        showToast('error', 'Delete Failed', `Failed to delete tag: ${(error as Error).message}`);
                    }
                }
            );
        };



        // Helper function to get display name for domain types
        const getDisplayName = (domainType: string) => {
            const displayNames: Record<string, string> = {
                'person': 'Person Tags',
                'group': 'Group Tags',
                'song': 'Song Tags',
                'appointment': 'Appointment Tags'
            };
            return displayNames[domainType] || `${domainType} Tags`;
        };

        // Helper function to get color information
        const getColorInfo = (colorName: string) => {
            const colorMap: Record<string, {hex: string, name: string, tailwind: string}> = {
                // System Colors
                'parent': {hex: '#6b7280', name: 'Parent', tailwind: 'gray-500'},
                'default': {hex: '#6b7280', name: 'Default', tailwind: 'gray-500'},
                'accent': {hex: '#007cba', name: 'Accent', tailwind: 'custom'},
                'basic': {hex: '#6b7280', name: 'Basic', tailwind: 'gray-500'},

                // Standard Colors
                'amber': {hex: '#f59e0b', name: 'Amber', tailwind: 'amber-500'},
                'black': {hex: '#000000', name: 'Black', tailwind: 'black'},
                'blue': {hex: '#3b82f6', name: 'Blue', tailwind: 'blue-500'},
                'cyan': {hex: '#06b6d4', name: 'Cyan', tailwind: 'cyan-500'},
                'emerald': {hex: '#10b981', name: 'Emerald', tailwind: 'emerald-500'},
                'fuchsia': {hex: '#d946ef', name: 'Fuchsia', tailwind: 'fuchsia-500'},
                'gray': {hex: '#6b7280', name: 'Gray', tailwind: 'gray-500'},
                'green': {hex: '#16a34a', name: 'Green', tailwind: 'green-600'},
                'indigo': {hex: '#6366f1', name: 'Indigo', tailwind: 'indigo-500'},
                'lime': {hex: '#84cc16', name: 'Lime', tailwind: 'lime-500'},
                'orange': {hex: '#f97316', name: 'Orange', tailwind: 'orange-500'},
                'pink': {hex: '#ec4899', name: 'Pink', tailwind: 'pink-500'},
                'purple': {hex: '#a855f7', name: 'Purple', tailwind: 'purple-500'},
                'red': {hex: '#dc2626', name: 'Red', tailwind: 'red-600'},
                'rose': {hex: '#f43f5e', name: 'Rose', tailwind: 'rose-500'},
                'sky': {hex: '#0ea5e9', name: 'Sky', tailwind: 'sky-500'},
                'teal': {hex: '#14b8a6', name: 'Teal', tailwind: 'teal-500'},
                'violet': {hex: '#8b5cf6', name: 'Violet', tailwind: 'violet-500'},
                'white': {hex: '#ffffff', name: 'White', tailwind: 'white'},
                'yellow': {hex: '#eab308', name: 'Yellow', tailwind: 'yellow-500'},

                // Semantic Colors
                'critical': {hex: '#dc2626', name: 'Critical', tailwind: 'red-600'},
                'constructive': {hex: '#16a34a', name: 'Constructive', tailwind: 'green-600'},
                'destructive': {hex: '#dc2626', name: 'Destructive', tailwind: 'red-600'},
                'danger': {hex: '#dc2626', name: 'Danger', tailwind: 'red-600'},
                'error': {hex: '#dc2626', name: 'Error', tailwind: 'red-600'},
                'info': {hex: '#3b82f6', name: 'Info', tailwind: 'blue-500'},
                'success': {hex: '#16a34a', name: 'Success', tailwind: 'green-600'},
                'warning': {hex: '#f59e0b', name: 'Warning', tailwind: 'amber-500'},
                'magic': {hex: '#8b5cf6', name: 'Magic', tailwind: 'violet-500'}
            };

            return colorMap[colorName] || {hex: '#6b7280', name: colorName, tailwind: 'gray-500'};
        };

        /**
         * Converts a hex color string to RGB values (0-1)
         * @throws {Error} If the hex string is invalid
         */
        const hexToRgb = (hex: string): [number, number, number] => {
            const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
            if (cleanHex.length !== 6) {
                return [0, 0, 0]; // Return black for invalid hex
            }

            return [
                parseInt(cleanHex.slice(0, 2), 16) / 255,
                parseInt(cleanHex.slice(2, 4), 16) / 255,
                parseInt(cleanHex.slice(4, 6), 16) / 255
            ];
        };

        // Helper function to convert hex to HSL for color sorting
        const hexToHsl = (hex: string): HSL => {
            if (!hex || hex === '') return {h: 0, s: 0, l: 0};

            // Convert to RGB using the new helper function
            const [r, g, b] = hexToRgb(hex);

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }

            return {h: h * 360, s: s * 100, l: l * 100};
        };

        // Function to get color category for special sorting
        const getColorCategory = (colorValue: string): number => {
            // System colors first
            if (['parent', 'default', 'basic'].includes(colorValue)) return 0;
            // Grayscale colors
            if (['black', 'gray', 'white'].includes(colorValue)) return 1;
            // Accent color
            if (colorValue === 'accent') return 2;
            // Regular colors
            return 3;
        };



        const closeColorPicker = () => {
            showColorPicker.value = false;
            selectedColorInPicker.value = '';
            colorPickerTarget.value = '';
        };

        const selectColorInPicker = (colorValue: string) => {
            selectedColorInPicker.value = colorValue;
            // Directly apply the color selection
            confirmColorSelection();
        };

        const confirmColorSelection = () => {
            if (colorPickerTarget.value === 'bulk') {
                bulkColor.value = selectedColorInPicker.value;
            } else if (colorPickerTarget.value === 'tag') {
                tagForm.color = selectedColorInPicker.value;
            }
            closeColorPicker();
        };

        // Simple modal using native DOM
        const showDeleteConfirmation = (title: string, message: string, callback: () => void) => {
            // Create modal HTML
            const modalHTML = `
                <div id="delete-modal" class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                    <div class="modal-content" style="background: white; border-radius: 8px; max-width: 500px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                        <div style="padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid #e9ecef;">
                            <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600;">${title}</h3>
                        </div>
                        <div style="padding: 1rem 1.5rem;">
                            <p style="margin: 0; color: #6c757d; line-height: 1.5; white-space: pre-line;">${message}</p>
                        </div>
                        <div style="padding: 1rem 1.5rem 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid #e9ecef;">
                            <button id="modal-cancel" class="ct-btn ct-btn-outline-secondary">Cancel</button>
                            <button id="modal-confirm" class="ct-btn ct-btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add to DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            const modal = document.getElementById('delete-modal');
            const cancelBtn = document.getElementById('modal-cancel');
            const confirmBtn = document.getElementById('modal-confirm');
            
            const closeModal = () => {
                if (modal) {
                    modal.remove();
                }
            };
            
            // Event listeners
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
            
            cancelBtn?.addEventListener('click', closeModal);
            
            confirmBtn?.addEventListener('click', () => {
                callback();
                closeModal();
            });
        };

        // Missing function implementations
        const selectBulkColor = (colorValue: string) => {
            bulkColor.value = colorValue;
            showBulkColorDropdown.value = false;
        };

        const selectTagColor = (colorValue: string) => {
            tagForm.color = colorValue;
            showTagColorDropdown.value = false;
        };

        const toggleBulkColorDropdown = () => {
            showBulkColorDropdown.value = !showBulkColorDropdown.value;
            showTagColorDropdown.value = false;
        };

        const toggleTagColorDropdown = () => {
            showTagColorDropdown.value = !showTagColorDropdown.value;
            showBulkColorDropdown.value = false;
        };

        const closeBothDropdowns = () => {
            showBulkColorDropdown.value = false;
            showTagColorDropdown.value = false;
        };

        const openColorPicker = (target: 'bulk' | 'tag') => {
            colorPickerTarget.value = target;
            selectedColorInPicker.value = target === 'bulk' ? bulkColor.value : tagForm.color;
            showColorPicker.value = true;
            closeBothDropdowns();
        };

        const toggleSelectAll = () => {
            if (allSelected.value) {
                clearSelection();
            } else {
                selectAll();
            }
        };

        const toggleTagSelection = (tagId: number) => {
            const index = selectedTags.value.indexOf(tagId);
            if (index > -1) {
                selectedTags.value.splice(index, 1);
            } else {
                selectedTags.value.push(tagId);
            }
        };

        const selectAll = () => {
            selectedTags.value = tags.value.map(tag => tag.id);
        };

        const clearSelection = () => {
            selectedTags.value = [];
        };

        const selectByPrefix = () => {
            if (!prefixFilter.value.trim()) return;
            
            const prefix = prefixFilter.value.toLowerCase().trim();
            const matchingTags = tags.value.filter(tag => 
                tag.name.toLowerCase().startsWith(prefix)
            );
            selectedTags.value = matchingTags.map(tag => tag.id);
        };

        const applyBulkColor = async () => {
            if (!bulkColor.value || selectedTags.value.length === 0) {
                showToast('warning', 'Missing Selection', 'Please select tags and a color');
                return;
            }

            isBulkOperating.value = true;
            try {
                const promises = selectedTags.value.map(tagId => {
                    const tag = tags.value.find(t => t.id === tagId);
                    if (tag) {
                        return apiRequest(`/tags/${tag.id}`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                name: tag.name,
                                description: tag.description || '',
                                color: bulkColor.value
                            })
                        });
                    }
                    return Promise.resolve();
                });

                await Promise.all(promises);
                showToast('success', 'Bulk Update', `Updated ${selectedTags.value.length} tags`);
                await loadTags();
                clearSelection();
            } catch (error) {
                console.error('Bulk color update failed:', error);
                showToast('error', 'Bulk Update Failed', (error as Error).message);
            } finally {
                isBulkOperating.value = false;
            }
        };

        const bulkDelete = () => {
            if (selectedTags.value.length === 0) {
                showToast('warning', 'No Selection', 'Please select tags to delete');
                return;
            }

            const tagCount = selectedTags.value.length;
            const tagNames = tags.value
                .filter(tag => selectedTags.value.includes(tag.id))
                .map(tag => tag.name)
                .slice(0, 3)
                .join(', ');
            
            const displayNames = tagCount > 3 ? `${tagNames} and ${tagCount - 3} more` : tagNames;

            showDeleteConfirmation(
                'Delete Multiple Tags',
                `Are you sure you want to delete ${tagCount} selected tags?\n\nTags: ${displayNames}\n\nThis action cannot be undone.`,
                async () => {
                    isBulkOperating.value = true;
                    try {
                        const promises = selectedTags.value.map(tagId => 
                            apiRequest(`/tags/${tagId}`, { method: 'DELETE' })
                        );

                        await Promise.all(promises);
                        showToast('success', 'Bulk Delete', `Deleted ${tagCount} tags successfully`);
                        await loadTags();
                        clearSelection();
                    } catch (error) {
                        console.error('Bulk delete failed:', error);
                        showToast('error', 'Bulk Delete Failed', (error as Error).message);
                    } finally {
                        isBulkOperating.value = false;
                    }
                }
            );
        };

        // Add click outside listener to close dropdowns and escape key handler
        onMounted(() => {
            document.addEventListener('click', closeBothDropdowns);

            // Add escape key handler for color picker
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    if (showColorPicker.value) {
                        closeColorPicker();
                    }
                    closeBothDropdowns();
                }
            });
        });

        // Check for stored authentication on mount
        onMounted(() => {
            const storedToken = localStorage.getItem('ct_login_token');
            const storedPersonId = localStorage.getItem('ct_person_id');
            const storedBaseUrl = localStorage.getItem('ct_base_url');
            const storedUsername = localStorage.getItem('ct_username');

            if (storedToken && storedPersonId && storedBaseUrl && storedUsername) {
                apiToken.value = storedToken;
                personId.value = parseInt(storedPersonId, 10);
                loginForm.baseUrl = storedBaseUrl;
                currentUser.value = storedUsername;
                isAuthenticated.value = true;

                // Load tags automatically
                loadTags();
            }
        });

        return {
            isAuthenticated,
            currentUser,
            isLoading,
            isLoadingTags,
            isSaving,
            loginError,
            loginStatus,
            tagError,
            selectedType,
            showCreateForm,
            editingTag,
            loginForm,
            tagForm,
            tags,
            selectedTags,
            prefixFilter,
            bulkColor,
            isBulkOperating,
            showBulkColorDropdown,
            showTagColorDropdown,
            showColorPicker,
            colorPickerTarget,
            selectedColorInPicker,
            selectBulkColor,
            selectTagColor,
            toggleBulkColorDropdown,
            toggleTagColorDropdown,
            closeBothDropdowns,
            openColorPicker,
            closeColorPicker,
            selectColorInPicker,
            confirmColorSelection,
            toasts,
            allSelected,
            login,
            logout,
            loadTags,
            editTag,
            saveTag,
            cancelEdit,
            deleteTag,
            toggleSelectAll,
            toggleTagSelection,
            selectAll,
            clearSelection,
            selectByPrefix,
            applyBulkColor,
            bulkDelete,
            getDisplayName,
            getColorInfo,
            colorOptions,
            sortedColorOptions,
            sortedTags,
            sortField,
            sortDirection,
            sortBy: (field: 'name' | 'description' | 'color') => {
                if (sortField.value === field) {
                    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
                } else {
                    sortField.value = field;
                    sortDirection.value = 'asc';
                }
            },
            showToast,
            removeToast
        };
    }
});

// Configure error handling
app.config.errorHandler = (err: unknown, vm: any, info: string) => {
    console.error('Vue error:', err);
    console.error('Error in component:', vm);
    console.error('Error info:', info);

    // Show error to user
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h2>Ein Fehler ist aufgetreten</h2>
                <p>Bitte laden Sie die Seite neu.</p>
                <p><small>${(err as Error)?.message || 'Unbekannter Fehler'}</small></p>
                <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Seite neu laden
                </button>
            </div>
        `;
    }
};

// Mount the app
console.log('Attempting to mount Vue app...');
try {
    app.mount('#app');
    console.log('Vue app mounted successfully');
    // Notify that Vue has finished mounting
    document.dispatchEvent(new Event('vue-mounted'));
    console.log('vue-mounted event dispatched');
} catch (error) {
    console.error('Error mounting Vue app:', error);
    console.error('Failed to mount Vue app:', error);
    const appElement = document.getElementById('app');
    if (appElement) {
        appElement.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h2>Fehler beim Laden der Anwendung</h2>
                <p>Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.</p>
                <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Erneut versuchen
                </button>
            </div>
        `;
    }

    // Hide loading screen
    const loading = document.getElementById('app-loading');
    if (loading) loading.style.display = 'none';
}
