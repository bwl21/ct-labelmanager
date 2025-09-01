# ChurchTools Label Manager - Development Guide

## Project Architecture

The ChurchTools Label Manager v2.0 is built as a **single-file Vue.js application** for maximum portability and ease of deployment.

### Current Structure

```
churchtools-label-manager/
├── index.html              # Complete Vue.js application (main file)
├── real-app.html          # Development version (same as index.html)
├── module.json            # ChurchTools module configuration
├── ct-labelmanager-v2.0.0.zip  # Deployment package
├── README.md              # User documentation
├── DEPLOYMENT.md          # Installation guide
├── DEVELOPMENT.md         # This file
└── legacy/                # Previous TypeScript/Webpack version
    ├── src/
    ├── dist/
    ├── package.json
    └── webpack.config.js
```

### Architecture Decision

**Single-File Application**: The entire application is contained in `index.html` with:
- **Embedded Vue.js 3**: Loaded from CDN
- **Inline CSS**: ChurchTools design system styles
- **Inline JavaScript**: Complete application logic
- **No Build Process**: Direct deployment ready

## Development Setup

### Prerequisites
- Modern web browser with developer tools
- Text editor or IDE
- Local web server (optional, for CORS testing)

### Quick Start
1. **Edit Application**:
   ```bash
   # Edit the main application file
   code index.html
   ```

2. **Test Locally**:
   ```bash
   # Option 1: Open directly in browser
   open index.html
   
   # Option 2: Use local server (recommended)
   python3 -m http.server 8080
   # Then open http://localhost:8080
   ```

3. **Create Package**:
   ```bash
   # Create deployment package
   zip -r ct-labelmanager-v2.0.0.zip index.html module.json README.md DEPLOYMENT.md
   ```

## Application Structure

### Vue.js Application Architecture

The application is built using **Vue.js 3 Composition API** with the following structure:

```javascript
// Main Vue application
const { createApp, ref, reactive, computed, onMounted } = Vue;

createApp({
    setup() {
        // Reactive state
        const isAuthenticated = ref(false);
        const tags = ref([]);
        const toasts = ref([]);
        
        // Reactive forms
        const loginForm = reactive({
            baseUrl: 'https://testbernhard.church.tools',
            username: '',
            password: ''
        });
        
        // API functions
        const apiRequest = async (endpoint, options) => { /* ... */ };
        const login = async () => { /* ... */ };
        
        // UI functions
        const showToast = (type, title, message) => { /* ... */ };
        
        return {
            // Export all reactive data and functions
        };
    }
}).mount('#app');
```

### Key Components

1. **Authentication System**
   - ChurchTools login with username/password
   - Token-based authentication with localStorage persistence
   - Automatic token refresh handling

2. **Tag Management**
   - CRUD operations for Person and Song tags
   - Modal-based create/edit interface
   - Real-time validation and duplicate detection

3. **Bulk Operations**
   - Multi-select functionality
   - Bulk color changes
   - Bulk delete operations
   - Prefix-based selection

4. **UI Components**
   - Toast notification system
   - Sortable table with click-to-sort
   - Responsive modal dialogs
   - ChurchTools design system integration

## Configuration

### ChurchTools Instance
Update the default baseUrl in the loginForm reactive object:
```javascript
const loginForm = reactive({
    baseUrl: 'https://your-instance.church.tools', // Change this
    username: '',
    password: ''
});
```

### Styling Customization
Modify CSS variables in the `<style>` section:
```css
:root {
  --ct-primary: #007cba;        /* Primary color */
  --ct-primary-hover: #0056b3;  /* Hover color */
  --ct-success: #28a745;        /* Success color */
  --ct-danger: #dc3545;         /* Error color */
}
```

### API Endpoints
The application uses these ChurchTools API endpoints:
- `POST /api/login` - User authentication
- `GET /api/persons/{id}/logintoken` - Get authentication token
- `GET /api/tags?type={type}` - Fetch tags by type (persons/songs)
- `POST /api/tags?type={type}` - Create new tag
- `PUT /api/tags/{id}?type={type}` - Update existing tag
- `DELETE /api/tags/{id}?type={type}` - Delete tag

## Technical Implementation

### State Management

The application uses Vue.js reactive state management:

```javascript
// Authentication state
const isAuthenticated = ref(false);
const currentUser = ref('');
const apiToken = ref('');

// UI state
const isLoading = ref(false);
const showCreateForm = ref(false);
const editingTag = ref(null);

// Data state
const tags = ref([]);
const selectedTags = ref([]);
const toasts = ref([]);

// Form state
const tagForm = reactive({
    name: '',
    description: '',
    color: ''
});
```

### Error Handling

The application implements comprehensive error handling:

1. **API Errors**: Parse ChurchTools API responses
2. **PHP Warnings**: Handle mixed HTML/JSON responses
3. **Validation Errors**: Client-side and server-side validation
4. **Network Errors**: Connection and CORS issues
5. **Duplicate Detection**: Prevent duplicate tag creation

### Toast Notification System

```javascript
const showToast = (type, title, message, duration = 5000) => {
    const toast = { 
        id: Date.now() + Math.random(), 
        type, 
        title, 
        message, 
        removing: false 
    };
    toasts.value.push(toast);
    
    setTimeout(() => removeToast(toast.id), duration);
};
```

## Development Workflow

### Making Changes

1. **Edit `index.html`** directly
2. **Test in browser** with developer tools open
3. **Check console** for errors and warnings
4. **Test API calls** in Network tab
5. **Verify responsive design** on different screen sizes

### Adding Features

1. **Add reactive state** in the `setup()` function
2. **Create functions** for new functionality
3. **Add HTML elements** in the template
4. **Style with CSS** using ChurchTools design tokens
5. **Export functions** in the return statement

### Debugging

1. **Browser Console**: Check for JavaScript errors
2. **Network Tab**: Monitor API requests and responses
3. **Vue DevTools**: Install browser extension for Vue debugging
4. **Application Tab**: Check localStorage for authentication tokens

## Legacy Architecture (v1.0)

The previous version used TypeScript and Webpack:

### Legacy Components

1. **LabelManager Class** (`legacy/src/main.ts`)
   - Main application controller
   - UI management and event handling
   - Integration with API service

2. **ChurchToolsApiService Class** (`src/api.ts`)
   - Handles all API communication
   - Authentication management
   - Error handling and response parsing

3. **UI Components**
   - Authentication form
   - Tag creation form
   - Tag list with cards
   - Message notifications

### Key Features

- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Immediate UI updates after API calls
- **Error Handling**: Comprehensive error messages and recovery
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Clean, professional interface

## Deployment

1. **Build Production Version**
   ```bash
   npm run build
   ```

2. **Create Deployment Package**
   ```bash
   zip -r ct-labelmanager-v1.0.0.zip dist/
   ```

3. **Upload to ChurchTools**
   - Go to Administration > Custom Modules
   - Upload the ZIP file
   - Activate the module

## API Integration Details

### Authentication Flow
1. User enters credentials
2. POST to `/api/login` with username/password
3. Store returned JWT token
4. Use token in Authorization header for subsequent requests

### Tag Management
- All tag operations use the `/api/tags` endpoint
- Support for different domain types (person, group, event, etc.)
- Color and description support
- Real-time CRUD operations

## Customization

### Adding New Features
1. Add new methods to `ChurchToolsApiService` for API calls
2. Update `LabelManager` to handle new UI interactions
3. Add corresponding UI elements and styling

### Styling
- CSS is embedded in `main.ts` for single-file deployment
- Uses modern CSS Grid and Flexbox
- Responsive breakpoints for mobile support

### Error Handling
- API errors are caught and displayed to users
- Network errors show appropriate messages
- Authentication failures redirect to login

## Testing

### Local Testing
1. Use `test.html` for local development
2. Test with actual ChurchTools instance
3. Verify all CRUD operations work correctly

### Production Testing
1. Deploy to test ChurchTools instance
2. Test with different user permissions
3. Verify mobile responsiveness

## Troubleshooting

### Common Issues

1. **Authentication Fails**
   - Check ChurchTools URL is correct
   - Verify credentials are valid
   - Check network connectivity

2. **API Errors**
   - Verify user has required permissions
   - Check ChurchTools version compatibility
   - Review browser console for detailed errors

3. **Build Errors**
   - Run `npm install` to ensure dependencies
   - Check TypeScript compilation errors
   - Verify webpack configuration

### Debug Mode
Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper TypeScript types
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details.