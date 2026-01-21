const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Removes the AD_ID permission from the Android manifest.
 * This prevents Google Play Services libraries from declaring advertising ID usage.
 */
const withRemoveAdId = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Add the AD_ID permission with tools:node="remove" to explicitly remove it
    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }

    // Check if AD_ID removal already exists
    const hasAdIdRemoval = androidManifest.manifest['uses-permission'].some(
      (permission) =>
        permission.$['android:name'] === 'com.google.android.gms.permission.AD_ID'
    );

    if (!hasAdIdRemoval) {
      androidManifest.manifest['uses-permission'].push({
        $: {
          'android:name': 'com.google.android.gms.permission.AD_ID',
          'tools:node': 'remove',
        },
      });
    }

    return config;
  });
};

module.exports = withRemoveAdId;
