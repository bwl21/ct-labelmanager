# ChurchTools Label Manager - Deployment Guide

## 📦 Deployment Package

The current deployment uses a standalone HTML file approach:

- `real-app.html` - Complete Vue.js application with ChurchTools integration
- Self-contained with embedded CSS, JavaScript, and Vue.js framework
- No build process required - ready to deploy directly

## 🚀 Installation Steps

### Option 1: Web Server Deployment (Recommended)

#### 1. Prerequisites
- Web server (Apache, Nginx, or simple HTTP server)
- ChurchTools instance accessible from the web server
- HTTPS recommended for production

#### 2. Deploy Application
1. Copy `real-app.html` to your web server
2. Rename to `index.html` (optional)
3. Ensure the file is accessible via web browser
4. Configure CORS if needed (see Configuration section)

#### 3. Access Application
1. Navigate to your deployed URL (e.g., `https://your-domain.com/labelmanager/`)
2. Enter your ChurchTools instance URL
3. Login with your ChurchTools credentials

### Option 2: Local File Access

#### 1. Direct File Access
1. Download `real-app.html`
2. Open directly in web browser
3. Enter ChurchTools URL and credentials

**Note**: Some browsers may block API calls from `file://` URLs due to CORS restrictions.

## ⚙️ Configuration

### Default Configuration
- **Default ChurchTools Instance**: `testbernhard.church.tools` (can be changed in UI)
- **Supported Tag Types**: Person Tags, Song Tags
- **Authentication**: ChurchTools login credentials
- **Required Permissions**: Tag management permissions

### Custom Configuration

#### 1. Change Default ChurchTools URL
Edit `real-app.html` and modify the default baseUrl:

```javascript
const loginForm = reactive({
    baseUrl: 'https://your-instance.church.tools', // Change this line
    username: '',
    password: ''
});
```

#### 2. CORS Configuration
If deploying on a different domain than ChurchTools:

**For Apache** (`.htaccess`):
```apache
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

**For Nginx**:
```nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
add_header Access-Control-Allow-Headers "Content-Type, Authorization";
```

#### 3. Branding Customization
Modify the CSS variables in `real-app.html`:

```css
:root {
  --ct-primary: #007cba;        /* Primary color */
  --ct-primary-hover: #0056b3;  /* Hover color */
  --ct-success: #28a745;        /* Success color */
  --ct-danger: #dc3545;         /* Error color */
}
```

## 🔐 Permissions

Users need appropriate ChurchTools permissions to manage tags:

- **Tag Management**: Ability to create, edit, and delete tags
- **Person/Song Access**: Depending on tag type being managed
- **API Access**: ChurchTools API access (usually granted by default)

### Setting Permissions in ChurchTools
1. Go to **Administration** > **Persons** > **Roles**
2. Edit the relevant role
3. Grant tag management permissions
4. Ensure API access is enabled

**Note**: Specific permission names may vary by ChurchTools version.

## 🧪 Testing

### Basic Functionality Test
1. **Authentication**: Login with ChurchTools credentials
2. **View Tags**: Verify existing tags are displayed with sorting
3. **Create Tag**: Add new tags with name, description, and color
4. **Edit Tag**: Modify existing tags using modal interface
5. **Delete Tag**: Remove tags with confirmation dialog
6. **Bulk Operations**: 
   - Select multiple tags
   - Apply bulk color changes
   - Bulk delete operations
   - Prefix-based selection

### Advanced Features Test
1. **Sortable Table**: Click column headers to sort by ID, Name, Description, Color
2. **Toast Notifications**: Verify success/error/warning messages appear
3. **Modal Interface**: Test create/edit modal functionality
4. **Duplicate Detection**: Try creating tags with existing names
5. **Error Handling**: Test with invalid data and network issues

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (responsive design)

### Mobile Testing
- Responsive layout on various screen sizes
- Touch-friendly interface
- Modal dialogs work on mobile
- Toast notifications display properly

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
- **Cause**: Browser blocking cross-origin requests
- **Solution**: 
  - Deploy on same domain as ChurchTools
  - Configure CORS headers on web server
  - Use HTTPS for both application and ChurchTools

#### 2. Authentication Fails
- **Cause**: Incorrect ChurchTools URL or credentials
- **Solution**: 
  - Verify ChurchTools URL is correct and accessible
  - Check username/password
  - Ensure ChurchTools API is enabled

#### 3. "Network Error" Messages
- **Cause**: ChurchTools instance not reachable
- **Solution**:
  - Check ChurchTools URL format (include https://)
  - Verify ChurchTools instance is online
  - Check firewall/network restrictions

#### 4. PHP Warnings in Console
- **Cause**: ChurchTools backend issues (known issue)
- **Solution**: 
  - Warnings are handled gracefully
  - Operations continue to work
  - Contact ChurchTools support for backend fixes

#### 5. Color Validation Errors
- **Cause**: Using invalid color names
- **Solution**: Use only supported ChurchTools colors from dropdown

#### 6. Duplicate Tag Errors
- **Cause**: Tag name already exists
- **Solution**: Application now prevents duplicates client-side

### Debug Information
Enable browser developer tools and check:
- **Console**: JavaScript errors, API responses, and PHP warnings
- **Network**: HTTP requests/responses to ChurchTools API
- **Application**: Local storage for authentication tokens
- **Elements**: Check for proper Vue.js component rendering

## 📊 Monitoring

### Usage Metrics
Monitor the following:
- **Browser Console**: JavaScript errors and warnings
- **ChurchTools Logs**: API authentication and tag operations
- **Network Traffic**: API calls to `/api/tags` endpoints
- **User Feedback**: Toast notifications and error messages

### Performance
- **Application Load**: ~2-3 seconds (includes Vue.js framework)
- **API Response Time**: Depends on ChurchTools server performance
- **Memory Usage**: ~5-10 MB (Vue.js application)
- **Network Usage**: Minimal after initial load

## 🔄 Updates

### Updating the Application
1. Download latest `real-app.html` from repository
2. Replace existing file on web server
3. Clear browser cache if needed
4. Test functionality after update

### Version History
- **v2.0.0**: Vue.js rewrite with enhanced UI
  - Modal-based create/edit interface
  - Toast notifications system
  - Sortable table columns
  - Bulk operations (select, color change, delete)
  - Improved error handling
  - ChurchTools design system integration
  - Description field support
  - All 33 ChurchTools colors supported
- **v1.0.0**: Initial TypeScript/Webpack version

## 📞 Support

### For Administrators
1. Check ChurchTools system logs
2. Verify user permissions
3. Test with different user accounts

### For Developers
1. Review browser console errors
2. Check API endpoint responses
3. Verify ChurchTools API documentation

### Contact Information
- **Technical Issues**: Check DEVELOPMENT.md
- **Feature Requests**: Submit via repository issues
- **ChurchTools Support**: Contact ChurchTools support team

---

## ✅ Deployment Checklist

- [ ] ChurchTools version 3.25.0+ verified
- [ ] Custom Modules feature enabled
- [ ] Administrator permissions granted
- [ ] Module ZIP file uploaded
- [ ] Module activated in ChurchTools
- [ ] Basic functionality tested
- [ ] User permissions configured
- [ ] Documentation provided to users
- [ ] Support process established

**Deployment Complete! 🎉**