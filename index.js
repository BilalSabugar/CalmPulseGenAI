import "@expo/metro-runtime";

import { registerRootComponent } from "expo";

import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont(); // manually load if needed

import Ionicons from 'react-native-vector-icons/Ionicons';
Ionicons.loadFont();


import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);