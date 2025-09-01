# External Files Documentation

## Overview

The ChurchTools Tag Manager has been refactored to use external CSS and JavaScript files for better maintainability and ChurchTools embedded mode compatibility.

## File Structure

```
ct-labelmanager/
├── index.html          # Main HTML structure with external references
├── styles.css          # Complete CSS styling and design system
├── app.js              # Vue.js application logic and functionality
├── module.json         # ChurchTools module configuration
├── README.md           # Project documentation
├── DEPLOYMENT.md       # Deployment instructions
├── build.js            # Node.js build script
└── package.json        # npm configuration and scripts
```

## External Files Details

### 1. styles.css (17,091 bytes)
**Purpose:** Complete CSS styling and ChurchTools design system

**Contents:**
- CSS Custom Properties (CSS Variables) for theming
- ChurchTools component styles (buttons, forms, cards, tables)
- Complete color palette with semantic colors
- Interactive elements (dropdowns, modals, tooltips)
- Responsive design utilities
- Animation keyframes and transitions
- Custom scrollbars and focus states

**Key Features:**
- ChurchTools brand colors and design tokens
- Consistent component styling across the application
- Responsive grid and layout utilities
- Accessibility-focused design patterns

### 2. app.js (44,619 bytes)
**Purpose:** Complete Vue.js application logic and functionality

**Contents:**
- Vue.js 3 Composition API setup
- Reactive state management
- ChurchTools API integration
- Authentication handling (embedded and standalone modes)
- Tag management CRUD operations
- Bulk operations functionality
- Color picker and dropdown components
- Toast notification system
- Embedded mode detection and auto-authentication

**Key Features:**
- **Embedded Mode Support:** Automatic detection and authentication
- **API Request Handling:** Smart authentication (tokens vs session cookies)
- **Bulk Operations:** Multi-tag selection and batch operations
- **Color Management:** Advanced color picker with ChurchTools palette
- **Error Handling:** Comprehensive error catching and user feedback

### 3. index.html (21,439 bytes)
**Purpose:** Clean HTML structure with external file references

**Contents:**
- Semantic HTML structure
- Vue.js template with directives
- External CSS and JavaScript references
- No inline styles or scripts

**Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChurchTools Tag Manager - Real API</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app" class="ct-app min-h-screen">
        <!-- Vue.js template content -->
    </div>
    
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

## ChurchTools Embedded Mode Compatibility

### How It Works
1. **Detection:** Automatically detects ChurchTools environment via URL pattern
2. **Authentication:** Uses existing ChurchTools session (no login required)
3. **API Requests:** Smart switching between session cookies and login tokens
4. **Base URL:** Intelligent detection from referrer or parent window

### External Files in Embedded Mode
- **CSS Loading:** External stylesheet loaded via `<link>` tag in head
- **JavaScript Loading:** External script loaded via `<script>` tag
- **ChurchTools CCM:** Processes head content and loads external resources
- **Fallback Handling:** Graceful degradation if external files fail to load

## Build Process

### Two Build Methods Available

#### 1. Node.js Build Script
```bash
node build.js
```
**Features:**
- Comprehensive validation and error checking
- Colored console output with progress indicators
- Package integrity verification
- Detailed build information and next steps

#### 2. npm Build Scripts
```bash
npm run build
```
**Features:**
- Standard npm workflow integration
- Modular script composition
- Package size reporting
- Contents verification

### Build Output
Both methods create identical packages:
```
ct-labelmanager-v2.0.0.zip (23K)
├── index.html      (21,439 bytes)
├── styles.css      (17,091 bytes)
├── app.js          (44,619 bytes)
├── module.json     (564 bytes)
├── README.md       (4,821 bytes)
└── DEPLOYMENT.md   (7,879 bytes)
```

## Development Workflow

### Local Development
```bash
# Start development server
npm run dev
# or
python3 -m http.server 8000
```

### Testing Embedded Mode
Add URL parameters to simulate embedded mode:
```
http://localhost:8000/?embedded=true&baseUrl=https://your-church.church.tools
```

### Building for Production
```bash
# Using npm
npm run build

# Using Node.js script
node build.js
```

## Deployment

### ChurchTools Installation
1. Build the package using either build method
2. Upload `ct-labelmanager-v2.0.0.zip` to ChurchTools
3. Navigate to Administration > Custom Modules
4. Upload and activate the module
5. Test functionality in both standalone and embedded modes

### File Dependencies
All external files are included in the deployment package:
- No additional setup required
- All resources are self-contained
- Works offline after initial load

## Troubleshooting

### Common Issues

#### CSS Not Loading
- **Symptom:** Unstyled application
- **Cause:** External CSS file not found or blocked
- **Solution:** Verify `styles.css` is in the same directory as `index.html`

#### JavaScript Not Working
- **Symptom:** Static page, no interactivity
- **Cause:** External JS file not found or syntax errors
- **Solution:** Check browser console for errors, verify `app.js` is accessible

#### Embedded Mode Issues
- **Symptom:** Authentication fails in ChurchTools
- **Cause:** Base URL detection problems
- **Solution:** Check browser console for debug logs, verify ChurchTools session

### Debug Mode
Enable debug logging by adding URL parameter:
```
?embedded=true&baseUrl=https://your-church.church.tools
```

Check browser console for detailed logs:
- Embedded mode detection
- Base URL resolution
- API request details
- Authentication flow

## Migration Notes

### From Inline to External Files
- **Before:** All CSS and JavaScript was inline in `index.html`
- **After:** Clean separation with external `styles.css` and `app.js`
- **Benefits:** Better maintainability, caching, and development experience

### Backward Compatibility
- **ChurchTools CCM:** Fully compatible with external file structure
- **Standalone Mode:** Works identically to previous versions
- **API Compatibility:** No changes to ChurchTools API usage

## Performance Considerations

### File Sizes
- **Total Package:** 96,413 bytes (23K compressed)
- **CSS:** 17,091 bytes (well-optimized for functionality)
- **JavaScript:** 44,619 bytes (complete Vue.js application)

### Loading Strategy
- **CSS:** Loaded in head for immediate styling
- **JavaScript:** Loaded at end of body for optimal performance
- **Vue.js:** Loaded from CDN for caching benefits

### Caching
- **External Files:** Can be cached by browser
- **CDN Resources:** Vue.js cached across sites
- **ChurchTools:** May cache external resources in embedded mode