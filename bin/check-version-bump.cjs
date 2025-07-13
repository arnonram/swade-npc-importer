#!/usr/bin/env node
// This script checks if the package.json version is different from master.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PACKAGE_JSON = path.join(__dirname, '../package.json');

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  return pkg.version;
}

function getMainVersion() {
  const content = execSync('git show origin/main:package.json', {
    encoding: 'utf8',
  });
  return JSON.parse(content).version;
}

const current = getCurrentVersion();
const main = getMainVersion();

if (current === main) {
  console.error(
    `\u001b[31mError: package.json version (${current}) was not bumped from main (${main})!\u001b[0m`,
  );
  process.exit(1);
} else {
  console.log(`package.json version bump detected: ${main} -> ${current}`);
}
