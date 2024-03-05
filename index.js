/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {
  registerBackgroundMessageListener,
  registerForegroundMessageListener,
  registerKillStateMessageListener,
} from './src/libs/firebase';

// Registered FCM Message listener to App
registerForegroundMessageListener();
registerBackgroundMessageListener();
registerKillStateMessageListener();

AppRegistry.registerComponent(appName, () => App);
