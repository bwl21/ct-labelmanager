# ChurchTools Label Manager - Build Automation
# Usage: make [target]

.PHONY: help build package clean dev test release version-patch version-minor version-major

# Default target
help:
	@echo "🚀 ChurchTools Label Manager - Build Automation"
	@echo "================================================"
	@echo ""
	@echo "Available targets:"
	@echo "  build         - Build the complete package"
	@echo "  package       - Create ZIP package only"
	@echo "  clean         - Remove old packages"
	@echo "  dev           - Start development server"
	@echo "  test          - Run validation tests"
	@echo "  release       - Full release build with validation"
	@echo "  version-patch - Bump patch version (x.x.X)"
	@echo "  version-minor - Bump minor version (x.X.x)"
	@echo "  version-major - Bump major version (X.x.x)"
	@echo ""
	@echo "Examples:"
	@echo "  make build              # Build package"
	@echo "  make version-patch      # 2.0.0 -> 2.0.1"
	@echo "  make dev                # Start dev server"

# Build complete package
build:
	@echo "🔨 Building ChurchTools Label Manager..."
	npm run build

# Create package only
package:
	@echo "📦 Creating package..."
	npm run package

# Clean old packages
clean:
	@echo "🧹 Cleaning old packages..."
	npm run clean

# Start development server
dev:
	@echo "🚀 Starting development server..."
	@echo "Open http://localhost:8080 in your browser"
	npm run dev

# Run tests/validation
test:
	@echo "🧪 Running validation tests..."
	npm run validate

# Full release build
release:
	@echo "🚀 Creating release build..."
	npm run release

# Version bumping
version-patch:
	@echo "📈 Bumping patch version..."
	npm run version:patch
	@echo "✅ Version updated. Run 'make build' to create new package."

version-minor:
	@echo "📈 Bumping minor version..."
	npm run version:minor
	@echo "✅ Version updated. Run 'make build' to create new package."

version-major:
	@echo "📈 Bumping major version..."
	npm run version:major
	@echo "✅ Version updated. Run 'make build' to create new package."

# Quick development workflow
quick: clean build
	@echo "⚡ Quick build completed!"

# Show current version
version:
	@echo "Current version: $(shell node -p "require('./package.json').version")"

# Show package info
info:
	@echo "📋 Package Information:"
	@echo "Name: $(shell node -p "require('./package.json').name")"
	@echo "Version: $(shell node -p "require('./package.json').version")"
	@echo "Description: $(shell node -p "require('./package.json').description")"
	@if [ -f ct-labelmanager-v*.zip ]; then \
		echo "Package size: $(shell ls -lh ct-labelmanager-v*.zip | awk '{print $$5}')"; \
	else \
		echo "No package found. Run 'make build' first."; \
	fi