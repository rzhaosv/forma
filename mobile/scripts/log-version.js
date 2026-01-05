#!/usr/bin/env node

/**
 * Build-time version logging script
 * Logs the app version and build number during the build process
 */

const fs = require('fs');
const path = require('path');

// Read app.json
const appJsonPath = path.join(__dirname, '../app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const version = appJson.expo.version;
const iosBuildNumber = appJson.expo.ios?.buildNumber || 'N/A';
const androidVersionCode = appJson.expo.android?.versionCode || 'N/A';

// Log version information
console.log('\n┌────────────────────────────────────────┐');
console.log('│         🚀 FORMA BUILD INFO           │');
console.log('└────────────────────────────────────────┘');
console.log(`📦 Version:           ${version}`);
console.log(`🍎 iOS Build:         ${iosBuildNumber}`);
console.log(`🤖 Android Build:     ${androidVersionCode}`);
console.log(`📅 Build Time:        ${new Date().toISOString()}`);
console.log(`🔧 Environment:       ${process.env.NODE_ENV || 'development'}`);

// Check for required environment variables during build
const openAiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
if (!openAiKey) {
  console.warn('\n⚠️  WARNING: EXPO_PUBLIC_OPENAI_API_KEY is missing!');
  console.warn('│  This will cause AI features to fail in the app.');
  console.warn('│  Make sure it is set in your .env or EAS secrets.\n');
} else if (openAiKey.includes('YOUR_')) {
  console.warn('\n⚠️  WARNING: EXPO_PUBLIC_OPENAI_API_KEY is still using a placeholder value!');
} else {
  console.log(`🔑 OpenAI Key:        ${openAiKey.substring(0, 7)}... (MATCHED)`);
}
console.log('─────────────────────────────────────────\n');

// Also write to a build info file for reference
const buildInfo = {
  version,
  iosBuildNumber,
  androidVersionCode,
  buildTime: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
};

const buildInfoPath = path.join(__dirname, '../build-info.json');
fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
console.log(`✅ Build info saved to: build-info.json\n`);

