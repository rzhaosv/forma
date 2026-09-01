// The error guard MUST be the first import so it installs (as a module side
// effect) before any other app code evaluates: uncaught JS errors in
// production then log + report instead of aborting the process via RCTFatal
// (the App Store startup-crash signature on iPad).
import './src/config/errorGuard';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
