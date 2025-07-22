const fs = require('fs');
const path = require('path');

// Paths to your package.json files
const rootPackageJsonPath = path.resolve(__dirname, 'package.json');       // root package.json
const homeyPackageJsonPath = path.resolve(__dirname, '../package.json'); // adjust path here

// Read and parse package.json files
const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
const homeyPackageJson = JSON.parse(fs.readFileSync(homeyPackageJsonPath, 'utf8'));

// Helper to safely get a version and clean it (remove ^, ~, etc)
function cleanVersion(version) {
  if (!version) return 'unknown';
  return version.replace(/^[\^~]/, '');
}

// Extract versions (adjust package names accordingly)
const versions = {
  REACT_APP_GRAMMY_VERSION: cleanVersion(homeyPackageJson.dependencies?.grammy),
  REACT_APP_BETTER_LOGIC_VERSION: cleanVersion(homeyPackageJson.dependencies?.betterlogiclibrary),
  REACT_APP_NODE_FETCH_VERSION: cleanVersion(homeyPackageJson.dependencies?.['node-fetch']),
  REACT_APP_REACT_VERSION: cleanVersion(rootPackageJson.dependencies?.react),
};
// Build .env content
const envContent = Object.entries(versions)
  .map(([key, val]) => `${key}=${val}`)
  .join('\n');

// Write to .env file in root
const envFilePath = path.resolve(__dirname, '.env');

fs.writeFileSync(envFilePath, envContent);

console.log('✅ .env file created/updated with package versions:');
console.log(envContent);
