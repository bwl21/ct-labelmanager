import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const moduleJson = JSON.parse(fs.readFileSync('module.json', 'utf8'));

const version = packageJson.version;
const name = packageJson.name;

// Create releases directory if it doesn't exist
const releasesDir = 'releases';
if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir);
}

// Copy built files to a temporary directory for packaging
const tempDir = `temp-${Date.now()}`;
fs.mkdirSync(tempDir);

try {
  // Copy dist contents to temp directory
  if (fs.existsSync('dist')) {
    execSync(`cp -r dist/* ${tempDir}/`);
  }
  
  // Copy module.json
  fs.copyFileSync('module.json', path.join(tempDir, 'module.json'));
  
  // Copy README and other documentation
  if (fs.existsSync('README.md')) {
    fs.copyFileSync('README.md', path.join(tempDir, 'README.md'));
  }
  if (fs.existsSync('DEPLOYMENT.md')) {
    fs.copyFileSync('DEPLOYMENT.md', path.join(tempDir, 'DEPLOYMENT.md'));
  }

  // Create the zip file
  const zipName = `${name}-v${version}.zip`;
  const zipPath = path.join(releasesDir, zipName);
  
  // Remove existing zip if it exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  
  // Create zip
  execSync(`cd ${tempDir} && zip -r ../${zipPath} .`);
  
  console.log(`✅ Package created: ${zipPath}`);
  
  // Show package info
  const stats = fs.statSync(zipPath);
  console.log(`📦 Package size: ${(stats.size / 1024).toFixed(2)} KB`);
  
  // Show contents
  console.log('\n📋 Package contents:');
  execSync(`unzip -l ${zipPath}`, { stdio: 'inherit' });
  
} finally {
  // Clean up temp directory
  if (fs.existsSync(tempDir)) {
    execSync(`rm -rf ${tempDir}`);
  }
}