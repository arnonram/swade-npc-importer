#!/usr/bin/env node
// This script updates the module.json file with the latest version from package.json in all places where it is used.

const fs = require('fs');
const path = require('path');

const PACKAGE_JSON = path.join(__dirname, '../package.json');
const MODULE_JSON = path.join(__dirname, '../src/module.json');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
const version = packageJson.version;

// Read module.json
const moduleJson = JSON.parse(fs.readFileSync(MODULE_JSON, 'utf8'));

// Update version
moduleJson.version = version;

// Update download link and readme link
moduleJson.download = `https://github.com/arnonram/swade-npc-importer/releases/download/v${version}/module.zip`;
moduleJson.readme = `https://github.com/arnonram/swade-npc-importer/tree/v${version}#swade-npc-importer`;

// Write back to module.json
fs.writeFileSync(
  MODULE_JSON,
  JSON.stringify(moduleJson, null, 2) + '\n',
  'utf8',
);

console.log(`Updated module.json to version ${version}`);
