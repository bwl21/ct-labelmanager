#!/bin/bash

# Validation script for devcontainer setup
echo "🔍 Validating devcontainer configuration..."

# Check if required files exist
echo "📁 Checking configuration files..."
files=(
    ".devcontainer/devcontainer.json"
    ".devcontainer/Dockerfile"
    ".devcontainer/setup.sh"
    "package.json"
    "vite.config.ts"
    "tsconfig.json"
    ".env-example"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done

# Check if Node.js would be available (in devcontainer)
echo ""
echo "🔧 Expected tools in devcontainer:"
echo "  📦 Node.js 20 (via devcontainer features)"
echo "  📦 npm (included with Node.js)"
echo "  📦 Vite (installed via npm)"
echo "  📦 TypeScript (installed via npm)"

# Validate JSON files using Node.js (when available)
echo ""
echo "🔍 Validating JSON configuration..."

if command -v node &> /dev/null; then
    echo "  📄 Checking devcontainer.json..."
    if node -e "JSON.parse(require('fs').readFileSync('.devcontainer/devcontainer.json', 'utf8'))" 2>/dev/null; then
        echo "    ✅ Valid JSON"
    else
        echo "    ❌ Invalid JSON"
    fi
    
    echo "  📄 Checking package.json..."
    if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        echo "    ✅ Valid JSON"
    else
        echo "    ❌ Invalid JSON"
    fi
    
    echo "  📄 Checking module.json..."
    if node -e "JSON.parse(require('fs').readFileSync('module.json', 'utf8'))" 2>/dev/null; then
        echo "    ✅ Valid JSON"
    else
        echo "    ❌ Invalid JSON"
    fi
else
    echo "  ⚠️ Node.js not available for JSON validation (will be available in devcontainer)"
fi

echo ""
echo "✅ Devcontainer configuration validation complete!"
echo ""
echo "🚀 To use the devcontainer:"
echo "  1. Open this project in VS Code"
echo "  2. Install the Dev Containers extension"
echo "  3. Click 'Reopen in Container' when prompted"
echo "  4. Wait for setup to complete"
echo "  5. Run 'npm run dev' to start development"