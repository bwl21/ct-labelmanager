# ChurchTools Embedded Mode Documentation

## Overview

The ChurchTools Tag Manager includes comprehensive support for ChurchTools embedded mode, allowing seamless integration within the ChurchTools Custom Component Manager (CCM).

## Features

### 🔍 Automatic Detection
- **URL Pattern Recognition:** Detects `*.church.tools` hostname with `/ccm/` pathname
- **Debug Mode:** Force embedded mode with URL parameter `?embedded=true`
- **Fallback Support:** Graceful degradation to standalone mode if detection fails

### 🔐 Auto-Authentication
- **Session-Based:** Uses existing ChurchTools session cookies
- **No Login Required:** Skips manual authentication when embedded
- **User Info Extraction:** Automatically retrieves user details via `/api/whoami`
- **Success Feedback:** Toast notification confirms auto-authentication

### 🌐 Smart API Requests
- **Context-Aware:** Automatically switches between authentication methods
- **Session Cookies:** Uses `credentials: 'include'` in embedded mode
- **Login Tokens:** Falls back to Authorization headers in standalone mode
- **Base URL Detection:** Intelligent detection from referrer or parent window

### 🛡️ Robust Fallback System
- **Multi-Level:** Embedded auth → Stored credentials → Manual login
- **Error Handling:** Comprehensive error catching and logging
- **Cross-Origin Safe:** Handles CORS restrictions gracefully

## Technical Implementation

### Detection Logic
```javascript
const isEmbeddedInChurchTools = () => {
    const { hostname, pathname } = window.location;
    const isEmbedded = hostname.endsWith('.church.tools') && pathname.startsWith('/ccm/');
    
    // Debug mode support
    const urlParams = new URLSearchParams(window.location.search);
    const forceEmbedded = urlParams.get('embedded') === 'true';
    
    return isEmbedded || forceEmbedded;
};
```

### Base URL Resolution
```javascript
const attemptChurchToolsAuth = async () => {
    let baseUrl = '';
    
    // Method 1: Extract from document.referrer
    if (document.referrer && document.referrer.includes('.church.tools')) {
        const referrerUrl = new URL(document.referrer);
        baseUrl = `${referrerUrl.protocol}//${referrerUrl.hostname}`;
    }
    
    // Method 2: Try parent window (CORS-safe)
    else if (window.parent !== window) {
        try {
            const parentUrl = new URL(window.parent.location.href);
            if (parentUrl.hostname.endsWith('.church.tools')) {
                baseUrl = `${parentUrl.protocol}//${parentUrl.hostname}`;
            }
        } catch (e) {
            // Cross-origin restriction
        }
    }
    
    // Method 3: URL parameter for debugging
    const urlParams = new URLSearchParams(window.location.search);
    const debugBaseUrl = urlParams.get('baseUrl');
    if (debugBaseUrl) {
        baseUrl = debugBaseUrl;
    }
    
    return baseUrl;
};
```

### Authentication Flow
```javascript
// 1. Detect embedded mode
if (isEmbeddedInChurchTools()) {
    // 2. Attempt ChurchTools session auth
    const success = await attemptChurchToolsAuth();
    
    if (!success) {
        // 3. Fallback to stored credentials
        checkStoredAuthentication();
    }
} else {
    // 4. Standalone mode
    checkStoredAuthentication();
}
```

### API Request Handling
```javascript
const apiRequest = async (endpoint, options = {}) => {
    const isEmbedded = isEmbeddedInChurchTools();
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Smart authentication
    if (apiToken.value && !isEmbedded) {
        // Standalone: Use Authorization header
        headers['Authorization'] = `Login ${apiToken.value}`;
    }
    // Embedded: Rely on session cookies (no additional headers needed)

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include'  // Always include cookies
    });
};
```

## Usage Scenarios

### 1. ChurchTools CCM Integration
**URL Pattern:** `https://your-church.church.tools/ccm/tagmanager`

**Behavior:**
- ✅ Automatic detection and authentication
- ✅ Uses existing ChurchTools session
- ✅ No login form displayed
- ✅ Direct access to tag management

### 2. Standalone Development
**URL Pattern:** `http://localhost:8000/`

**Behavior:**
- ✅ Manual ChurchTools URL entry
- ✅ Username/password authentication
- ✅ Token-based API requests
- ✅ Full functionality available

### 3. Debug/Testing Mode
**URL Pattern:** `http://localhost:8000/?embedded=true&baseUrl=https://your-church.church.tools`

**Behavior:**
- ✅ Simulates embedded mode
- ✅ Uses specified base URL
- ✅ Attempts session authentication
- ✅ Falls back to manual login if needed

## Debug Information

### Console Logging
The application provides comprehensive debug logging:

```javascript
// Embedded mode detection
Embedded mode detection: {
    hostname: "your-church.church.tools",
    pathname: "/ccm/tagmanager",
    isEmbedded: true,
    forceEmbedded: false,
    finalResult: true
}

// Authentication flow
Initializing authentication...
Embedded mode: true
attemptChurchToolsAuth: Starting...
Base URL from referrer: https://your-church.church.tools

// API requests
API Request: {
    endpoint: "/tags/person",
    url: "https://your-church.church.tools/api/tags/person",
    isEmbedded: true,
    hasToken: false,
    baseUrl: "https://your-church.church.tools"
}
Using session cookies for embedded mode
```

### Error Handling
```javascript
// Base URL detection failure
Could not determine ChurchTools base URL for embedded mode

// CORS restrictions
Cannot access parent window location due to CORS

// Authentication failure
ChurchTools auto-auth failed: [error details]
```

## Troubleshooting

### Common Issues

#### 1. Authentication Fails in Embedded Mode
**Symptoms:**
- Login form appears in embedded mode
- "ChurchTools auto-auth failed" in console

**Causes:**
- ChurchTools session expired
- CORS restrictions preventing base URL detection
- Invalid referrer information

**Solutions:**
- Refresh ChurchTools page to renew session
- Check browser console for detailed error logs
- Verify ChurchTools session is active

#### 2. Base URL Detection Problems
**Symptoms:**
- "Could not determine ChurchTools base URL" error
- API requests fail with network errors

**Causes:**
- Missing or invalid document.referrer
- Cross-origin restrictions on parent window access
- Incorrect URL patterns

**Solutions:**
- Use debug mode with explicit base URL
- Check referrer policy settings
- Verify ChurchTools CCM configuration

#### 3. API Requests Fail
**Symptoms:**
- Network errors in browser console
- "Failed to load tags" messages

**Causes:**
- Incorrect base URL
- Session authentication issues
- CORS configuration problems

**Solutions:**
- Verify base URL in debug logs
- Check ChurchTools session status
- Review CORS settings in ChurchTools

### Debug Mode Testing

#### Enable Debug Mode
Add URL parameters to any environment:
```
?embedded=true&baseUrl=https://your-church.church.tools
```

#### Test Authentication
1. Open browser developer tools
2. Navigate to Console tab
3. Look for authentication flow logs
4. Verify API request details

#### Verify Session
Test ChurchTools session manually:
```javascript
// In browser console on ChurchTools domain
fetch('/api/whoami', { credentials: 'include' })
    .then(r => r.json())
    .then(console.log);
```

## Best Practices

### For ChurchTools Administrators
1. **Test in Standalone Mode First:** Verify functionality before embedding
2. **Check Session Timeout:** Ensure reasonable session duration
3. **Monitor Console Logs:** Watch for authentication issues
4. **Verify CORS Settings:** Ensure proper cross-origin configuration

### For Developers
1. **Use Debug Mode:** Test embedded functionality locally
2. **Check Console Logs:** Monitor authentication and API flows
3. **Handle Fallbacks:** Ensure graceful degradation
4. **Test Both Modes:** Verify standalone and embedded functionality

### For End Users
1. **Keep Session Active:** Stay logged into ChurchTools
2. **Refresh if Needed:** Reload page if authentication fails
3. **Report Issues:** Provide console logs for troubleshooting
4. **Use Supported Browsers:** Ensure modern browser compatibility

## Security Considerations

### Session Security
- **Cookie-Based:** Uses secure ChurchTools session cookies
- **No Token Storage:** No sensitive tokens stored in embedded mode
- **Same-Origin:** Leverages ChurchTools same-origin security

### Cross-Origin Safety
- **CORS Compliant:** Respects cross-origin restrictions
- **Graceful Fallback:** Handles blocked cross-origin access
- **No Sensitive Data:** No credentials exposed in URLs or logs

### Authentication Flow
- **Session Validation:** Verifies session via `/api/whoami`
- **Automatic Fallback:** Falls back to secure authentication methods
- **Error Handling:** Secure error messages without sensitive details

## Future Enhancements

### Planned Features
- **Enhanced Error Recovery:** More robust fallback mechanisms
- **Performance Optimization:** Faster embedded mode detection
- **Extended Debug Tools:** More comprehensive debugging information
- **Configuration Options:** Customizable embedded mode behavior

### Compatibility
- **ChurchTools Versions:** Compatible with current ChurchTools releases
- **Browser Support:** Modern browsers with ES6+ support
- **Mobile Compatibility:** Full functionality on mobile devices
- **Accessibility:** WCAG 2.1 compliance for embedded mode