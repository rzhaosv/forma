const base = require('./app.json');

function ensureArray(value) {
  if (Array.isArray(value)) return [...value];
  if (value === undefined || value === null) return [];
  return [value];
}

module.exports = () => {
  const isDevDual = process.env.EAS_BUILD_PROFILE === 'dev-dual';
  const config = JSON.parse(JSON.stringify(base.expo));

  if (isDevDual) {
    // Keep the same name, only change bundle ID and scheme
    config.ios = {
      ...config.ios,
      bundleIdentifier: 'com.raymondzhao3000.forma.dev',
    };

    const schemes = ensureArray(config.scheme);
    if (!schemes.includes('forma-dev')) {
      schemes.push('forma-dev');
    }
    config.scheme = schemes;
  }

  // Note: Firebase native linking is handled by CocoaPods/Autolinking.
  // We don't need to add them to the Expo plugins array for native builds,
  // which avoids directory import errors in some Node versions.

  return { expo: config };
};

