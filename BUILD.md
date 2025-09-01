# Build Automation Guide

This document explains how to use the build automation system for the ChurchTools Label Manager.

## 🚀 Quick Start

```bash
# Install Node.js (if not already installed)
# Then run:

npm run build        # Build the package
# or
make build          # Alternative using Makefile
```

## 📋 Available Commands

### NPM Scripts

```bash
# Core build commands
npm run build                # Complete build process
npm run package             # Create ZIP package only
npm run clean               # Remove old packages

# Development
npm run dev                 # Start development server (localhost:8080)
npm run dev:open           # Start server and open browser

# Validation
npm run validate           # Validate all files
npm run test              # Run validation tests

# Version management
npm run version:patch      # Bump patch version (2.0.0 -> 2.0.1)
npm run version:minor      # Bump minor version (2.0.0 -> 2.1.0)
npm run version:major      # Bump major version (2.0.0 -> 3.0.0)

# Release
npm run release           # Full release build with validation
```

### Makefile Commands

```bash
# Build commands
make build                # Build the package
make package             # Create ZIP package only
make clean               # Remove old packages

# Development
make dev                 # Start development server

# Testing
make test                # Run validation tests

# Version management
make version-patch       # Bump patch version
make version-minor       # Bump minor version
make version-major       # Bump major version

# Information
make help                # Show all available commands
make info                # Show package information
make version             # Show current version

# Quick workflow
make quick               # Clean + build in one command
```

### Advanced Build Script

```bash
# Use the enhanced build script with colored output
node build.js
```

## 🔧 Build Process

### What happens during build:

1. **Validation**: Check that all required files exist
2. **Version Sync**: Ensure package.json and module.json versions match
3. **Cleanup**: Remove old package files
4. **Package Creation**: Create ZIP file with all necessary files
5. **Verification**: Validate package integrity
6. **Information**: Display package size and contents

### Files included in package:

- `index.html` - Main application (Vue.js single-file app)
- `module.json` - ChurchTools module configuration
- `README.md` - User documentation
- `DEPLOYMENT.md` - Installation guide

## 📦 Package Output

The build process creates:
```
ct-labelmanager-v{version}.zip
```

Example: `ct-labelmanager-v2.0.0.zip` (≈16-17 KB)

## 🔄 Version Management

### Automatic Version Sync

The build system automatically synchronizes versions between:
- `package.json` - NPM package version
- `module.json` - ChurchTools module version

### Bumping Versions

```bash
# Patch version (bug fixes): 2.0.0 -> 2.0.1
npm run version:patch
make version-patch

# Minor version (new features): 2.0.0 -> 2.1.0
npm run version:minor
make version-minor

# Major version (breaking changes): 2.0.0 -> 3.0.0
npm run version:major
make version-major
```

After bumping version, run build:
```bash
npm run build
# or
make build
```

## 🧪 Development Workflow

### 1. Local Development
```bash
# Start development server
npm run dev
# or
make dev

# Open http://localhost:8080 in browser
# Edit index.html directly
# Refresh browser to see changes
```

### 2. Testing Changes
```bash
# Validate files
npm run validate
# or
make test
```

### 3. Building Package
```bash
# Create package
npm run build
# or
make build
```

### 4. Release Process
```bash
# Full release with validation
npm run release
# or
make release
```

## 🛠️ Build Scripts

### package.json
Contains all NPM scripts for build automation.

### build.js
Enhanced build script with:
- Colored console output
- Detailed validation
- Progress indicators
- Error handling
- Package verification

### Makefile
Alternative build system using Make:
- Simple command syntax
- Cross-platform compatibility
- Quick development workflows

### scripts/version-sync.js
Utility to synchronize versions between package.json and module.json.

## 📁 File Structure

```
churchtools-label-manager/
├── package.json              # NPM configuration & scripts
├── build.js                  # Enhanced build script
├── Makefile                  # Make build system
├── scripts/
│   └── version-sync.js       # Version synchronization
├── index.html                # Main application
├── module.json               # ChurchTools configuration
├── README.md                 # User documentation
├── DEPLOYMENT.md             # Installation guide
└── BUILD.md                  # This file
```

## 🚨 Troubleshooting

### Common Issues

**"zip command not found"**
```bash
# Install zip utility
# Ubuntu/Debian:
sudo apt-get install zip

# macOS:
brew install zip

# Windows: Use WSL or install 7-zip
```

**"Node.js not found"**
```bash
# Install Node.js from https://nodejs.org
# Or use package manager:
# Ubuntu/Debian:
sudo apt-get install nodejs npm

# macOS:
brew install node
```

**Version mismatch errors**
```bash
# Sync versions manually
npm run update:module-version
# or
node scripts/version-sync.js
```

### Validation Errors

If validation fails:
1. Check that all required files exist
2. Verify module.json syntax
3. Ensure index.html is present
4. Run `npm run validate` for details

## 🎯 Best Practices

1. **Always validate before building**:
   ```bash
   npm run validate && npm run build
   ```

2. **Use version bumping for releases**:
   ```bash
   npm run version:patch
   npm run build
   ```

3. **Test locally before packaging**:
   ```bash
   npm run dev
   # Test in browser, then:
   npm run build
   ```

4. **Use release command for final builds**:
   ```bash
   npm run release
   ```

## 📚 Additional Resources

- [ChurchTools Custom Module Documentation](https://hilfe.church.tools)
- [Vue.js Documentation](https://vuejs.org)
- [NPM Scripts Documentation](https://docs.npmjs.com/cli/v7/using-npm/scripts)
- [Make Documentation](https://www.gnu.org/software/make/manual/)

---

**Happy Building! 🚀**