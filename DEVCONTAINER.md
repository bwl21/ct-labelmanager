# Development Container Setup

This project includes a complete development container configuration that provides a consistent development environment with all necessary tools pre-installed.

## What's Included

- **Node.js 20** - Latest LTS version with npm
- **Vite** - Modern build tool and dev server with hot reload
- **TypeScript** - Type checking and compilation
- **Essential build tools** - curl, wget, zip, unzip, build-essential
- **VS Code Extensions**:
  - Vue Language Features (Volar)
  - TypeScript support
  - Tailwind CSS IntelliSense
  - Prettier code formatter
  - JSON support

## Getting Started

### Option 1: VS Code with Dev Containers Extension

1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open the project in VS Code
3. Click "Reopen in Container" when prompted (or use Command Palette: "Dev Containers: Reopen in Container")
4. Wait for the container to build and setup to complete

### Option 2: Manual Setup

If you prefer to set up your own environment:

```bash
# Install Node.js 20+
# Install dependencies
npm install

# Start development
npm run dev
```

## Available Commands

Once the devcontainer is running, you can use these commands:

```bash
# Development
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build

# ChurchTools Plugin
npm run deploy       # Build and package for ChurchTools
./build-simple.sh    # Alternative build without Node.js

# Code Quality
npm run validate     # Validate module.json and files
```

## Port Forwarding

The devcontainer automatically forwards these ports:
- **5173** - Vite development server
- **8080** - Preview/static server

## Environment Configuration

1. Copy `.env-example` to `.env`
2. Configure your ChurchTools instance details:
   ```
   VITE_BASE_URL=https://your-church.church.tools
   VITE_USERNAME=your-username
   VITE_PASSWORD=your-password
   VITE_KEY=labelmanager
   ```

## VS Code Settings

The devcontainer includes optimized VS Code settings:
- Auto-format on save with Prettier
- TypeScript auto-imports
- Vue.js syntax highlighting and IntelliSense

## Troubleshooting

### Container Build Issues
```bash
# Rebuild container
Ctrl+Shift+P → "Dev Containers: Rebuild Container"
```

### Permission Issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Port Conflicts
If ports 5173 or 8080 are in use, the devcontainer will automatically use alternative ports.