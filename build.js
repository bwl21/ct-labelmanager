#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function main() {
  try {
    log('🚀 ChurchTools Label Manager - Build Automation', 'bright');
    log('=' .repeat(50), 'blue');

    // Read package.json for version
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const version = packageJson.version;
    const packageName = `ct-labelmanager-v${version}.zip`;

    logStep('1/6', 'Validating files...');
    
    // Validate required files
    const requiredFiles = ['index.html', 'module.json', 'README.md', 'DEPLOYMENT.md'];
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      logError(`Missing required files: ${missingFiles.join(', ')}`);
      process.exit(1);
    }
    
    logSuccess('All required files present');

    // Validate module.json
    logStep('2/6', 'Validating module.json...');
    const moduleJson = JSON.parse(fs.readFileSync('module.json', 'utf8'));
    
    if (moduleJson.version !== version) {
      logWarning(`Version mismatch: package.json (${version}) vs module.json (${moduleJson.version})`);
      log('Updating module.json version...', 'yellow');
      moduleJson.version = version;
      fs.writeFileSync('module.json', JSON.stringify(moduleJson, null, 2));
      logSuccess('module.json version updated');
    } else {
      logSuccess('module.json version matches');
    }

    // Clean old packages
    logStep('3/6', 'Cleaning old packages...');
    try {
      execSync('rm -f ct-labelmanager-v*.zip', { stdio: 'pipe' });
      logSuccess('Old packages cleaned');
    } catch (error) {
      log('No old packages to clean', 'yellow');
    }

    // Create package
    logStep('4/6', 'Creating package...');
    const zipCommand = `zip -r ${packageName} ${requiredFiles.join(' ')}`;
    execSync(zipCommand, { stdio: 'pipe' });
    logSuccess(`Package created: ${packageName}`);

    // Get package info
    logStep('5/6', 'Package information...');
    const stats = fs.statSync(packageName);
    const sizeKB = (stats.size / 1024).toFixed(1);
    log(`📦 Size: ${sizeKB} KB`, 'magenta');

    // List contents
    try {
      const contents = execSync(`unzip -l ${packageName}`, { encoding: 'utf8' });
      log('📋 Contents:', 'magenta');
      console.log(contents);
    } catch (error) {
      logWarning('Could not list package contents');
    }

    // Final validation
    logStep('6/6', 'Final validation...');
    
    // Check if package can be extracted
    try {
      execSync(`unzip -t ${packageName}`, { stdio: 'pipe' });
      logSuccess('Package integrity verified');
    } catch (error) {
      logError('Package integrity check failed');
      process.exit(1);
    }

    // Success summary
    log('=' .repeat(50), 'blue');
    log('🎉 Build completed successfully!', 'bright');
    log(`📦 Package: ${packageName}`, 'green');
    log(`📏 Size: ${sizeKB} KB`, 'green');
    log(`🏷️  Version: ${version}`, 'green');
    log('=' .repeat(50), 'blue');
    
    log('\n📋 Next steps:', 'cyan');
    log('1. Test the package locally', 'reset');
    log('2. Upload to ChurchTools: Administration > Custom Modules', 'reset');
    log('3. Activate the module', 'reset');
    log('4. Test functionality', 'reset');

  } catch (error) {
    logError(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };