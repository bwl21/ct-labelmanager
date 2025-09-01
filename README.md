# ChurchTools Label Manager v2.0

Advanced tag management interface for ChurchTools with enhanced UI, bulk operations, and comprehensive tag management capabilities.

## 🚀 Features

### Core Functionality
- **🔐 Secure Authentication** - ChurchTools login with token persistence
- **🏷️ Complete Tag Management** - Create, read, update, and delete tags
- **🎯 Dual Tag Types** - Support for Person Tags and Song Tags
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🎨 Modal Interface** - Clean, focused editing experience
- **📊 Sortable Table** - Click column headers to sort by any field

### Advanced Operations
- **🔄 Bulk Operations** - Select multiple tags for batch operations
- **🎨 Bulk Color Changes** - Apply colors to multiple tags at once
- **🗑️ Bulk Delete** - Remove multiple tags with confirmation
- **🔍 Prefix Selection** - Select tags by name prefix (e.g., "L:*")
- **🌈 All ChurchTools Colors** - Support for all 33 official colors
- **📝 Description Support** - Full description field with validation

### User Experience
- **🔔 Toast Notifications** - Non-blocking success/error/warning messages
- **🎨 ChurchTools Design** - Native ChurchTools styling and colors
- **⚡ Real-time Validation** - Client-side duplicate detection
- **🛡️ Enhanced Error Handling** - Graceful handling of API errors and PHP warnings

### ChurchTools Embedded Mode
- **🔗 Embedded Detection** - Automatically detects ChurchTools environment
- **🔐 Auto-Authentication** - Uses existing ChurchTools session (no login required)
- **🌐 Smart API Requests** - Adapts between session cookies and login tokens
- **📍 Base URL Detection** - Intelligent detection from referrer or parent window

## 🏗️ Architecture

### External File Structure
The application uses a clean external file structure for better maintainability:

```
ct-labelmanager/
├── index.html          # Clean HTML structure with external references
├── styles.css          # Complete CSS styling (17KB)
├── app.js              # Vue.js application logic (45KB)
├── module.json         # ChurchTools module configuration
└── documentation/      # Comprehensive docs
```

**Benefits:**
- ✅ Better code organization and maintainability
- ✅ Improved browser caching for external resources
- ✅ ChurchTools embedded mode compatibility
- ✅ Easier debugging and development

## 📦 Installation

### As ChurchTools Custom Module (Recommended)

1. **Enable Custom Modules** in ChurchTools:
   - Go to Administration > Settings
   - Enable "Custom Modules" feature
   - Grant yourself module management permissions

2. **Install Module**:
   - Download the latest release ZIP file
   - Go to Administration > Custom Modules
   - Click "Add Module" or "Upload Module"
   - Upload the ZIP file
   - Activate the module

3. **Access Application**:
   - Find "Label Manager" in your ChurchTools menu
   - Login with your ChurchTools credentials

### As Standalone Web Application

1. **Deploy to Web Server**:
   - Copy `index.html` to your web server
   - Ensure HTTPS is configured
   - Configure CORS if needed

2. **Access Application**:
   - Navigate to your deployed URL
   - Enter ChurchTools instance URL
   - Login with credentials

### For Developers

```bash
# Clone the repository
git clone <repository-url>
cd churchtools-label-manager

# Install dependencies (optional, for build automation)
npm install

# Start development server
npm run dev
# or
python3 -m http.server 8000

# Build package (two methods available)
npm run build          # npm-based build
# or
node build.js          # Node.js build script
```

#### Build Output
Both build methods create identical packages:
```
ct-labelmanager-v2.0.0.zip (23K)
├── index.html      (21KB) - Clean HTML structure
├── styles.css      (17KB) - Complete CSS styling
├── app.js          (45KB) - Vue.js application
├── module.json     - ChurchTools config
├── README.md       - Documentation
└── DEPLOYMENT.md   - Deployment guide
```

#### Testing Embedded Mode
Add URL parameters to simulate ChurchTools embedded mode:
```
http://localhost:8000/?embedded=true&baseUrl=https://your-church.church.tools
```

See [EXTERNAL_FILES.md](EXTERNAL_FILES.md) for detailed architecture documentation.

## 🔧 Configuration

The application automatically detects the ChurchTools environment:

- **Embedded Mode:** Auto-detects ChurchTools URL and uses session authentication
- **Standalone Mode:** Prompts for ChurchTools URL and credentials
- **Default URL:** Pre-configured for `testbernhard.church.tools` for testing
3. Upload the generated `ct-labelmanager-v{version}.zip` to ChurchTools

## 📋 Requirements

- **ChurchTools**: Version 3.25.0 or higher
- **Permissions**: `churchdb:view`, `churchdb:edit`
- **Browser**: Modern browser with ES6+ support

## 🛠️ Development

### Quick Start
```bash
npm run dev        # Start development server
npm run build      # Build deployment package
npm run validate   # Validate files
```

### Documentation
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide and architecture
- [BUILD.md](BUILD.md) - Build automation and deployment
- [DEPLOYMENT.md](DEPLOYMENT.md) - Installation and configuration

## 📖 API Integration

This module integrates with the ChurchTools REST API:

- `POST /api/login` - Authentication
- `GET /api/tags` - Fetch tags
- `POST /api/tags` - Create tags
- `PUT /api/tags/{id}` - Update tags
- `DELETE /api/tags/{id}` - Delete tags

## 🎯 Usage

1. **Authenticate**: Enter your ChurchTools username and password
2. **View Tags**: Browse all existing tags with their properties
3. **Create Tags**: Add new tags with name, color, description, and domain
4. **Edit Tags**: Modify existing tag properties
5. **Delete Tags**: Remove tags with confirmation

## 🔍 Testing

A test environment is available at the preview URL when running locally. The module includes:

- Authentication testing
- CRUD operations testing
- Error handling verification
- Responsive design testing

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read the development guide and submit pull requests for any improvements.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section in [DEVELOPMENT.md](DEVELOPMENT.md)
2. Review browser console for error details
3. Contact your ChurchTools administrator

---

**Built with ❤️ for the ChurchTools community**
CT-custom-module to manage labes
