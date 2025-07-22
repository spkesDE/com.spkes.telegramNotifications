import path from 'path';
import fs from 'fs';

const rootPackageJsonPath = path.resolve(process.cwd(), 'package.json');
const homeyPackageJsonPath = path.resolve(process.cwd(), '../package.json');

function cleanVersion(version) {
  if (!version) return 'unknown';
  return version.replace(/^[\^~]/, '');
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Fehler beim Lesen von ${filePath}:`, e);
    return {};
  }
}

const rootPackageJson = readJson(rootPackageJsonPath);
const homeyPackageJson = readJson(homeyPackageJsonPath);

const versions = {
  VITE_GRAMMY_VERSION: cleanVersion(homeyPackageJson.dependencies?.grammy),
  VITE_BETTER_LOGIC_VERSION: cleanVersion(homeyPackageJson.dependencies?.betterlogiclibrary),
  VITE_NODE_FETCH_VERSION: cleanVersion(homeyPackageJson.dependencies?.['node-fetch']),
  VITE_REACT_VERSION: cleanVersion(rootPackageJson.dependencies?.react),
};

const envContent = Object.entries(versions)
  .map(([key, val]) => `${key}=${val}`)
  .join('\n');

const envFilePath = path.resolve(process.cwd(), '.env');

try {
  fs.writeFileSync(envFilePath, envContent, 'utf8');
  console.log('✅ .env Datei wurde erstellt/aktualisiert:');
  console.log(envContent);
} catch (e) {
  console.error('Fehler beim Schreiben der .env Datei:', e);
}
