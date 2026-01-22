#!/bin/bash
# Build dev client locally with .dev bundle ID

# Set env var for app.config.js
export EAS_BUILD_PROFILE=dev-dual

# Clean any existing builds
rm -rf ios/build

# Run local iOS build
npx expo run:ios --device
