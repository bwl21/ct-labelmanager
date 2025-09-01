#!/usr/bin/env node

const fs = require('fs');

/**
 * Synchronizes version between package.json and module.json
 */
function syncVersions() {
  try {
    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const packageVersion = packageJson.version;

    // Read module.json
    const moduleJson = JSON.parse(fs.readFileSync('module.json', 'utf8'));
    const moduleVersion = moduleJson.version;

    console.log(`📦 package.json version: ${packageVersion}`);
    console.log(`🏷️  module.json version: ${moduleVersion}`);

    if (packageVersion !== moduleVersion) {
      console.log('🔄 Syncing versions...');
      
      // Update module.json with package.json version
      moduleJson.version = packageVersion;
      
      // Write back to module.json with proper formatting
      fs.writeFileSync('module.json', JSON.stringify(moduleJson, null, 2));
      
      console.log(`✅ Updated module.json version to ${packageVersion}`);
    } else {
      console.log('✅ Versions are already in sync');
    }

  } catch (error) {
    console.error(`❌ Error syncing versions: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  syncVersions();
}

module.exports = { syncVersions };