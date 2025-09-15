#!/bin/bash

# DevContainer setup script for ChurchTools Label Manager
echo "🚀 Setting up ChurchTools Label Manager development environment..."

# Install global development tools
echo "📦 Installing global npm packages..."
npm install -g @vitejs/cli vite typescript

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env-example .env
fi

# Make build scripts executable
chmod +x build-simple.sh

echo "✅ Development environment setup complete!"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev     - Start Vite development server"
echo "  npm run build   - Build for production"
echo "  npm run preview - Preview production build"
echo "  npm run deploy  - Build and package for ChurchTools"
echo "  ./build-simple.sh - Simple build without Node.js"
echo ""
echo "🌐 Development server will be available at:"
echo "  http://localhost:5173 (Vite dev server)"
echo "  http://localhost:8080 (Preview server)"