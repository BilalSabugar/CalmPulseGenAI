// App.js
import 'react-native-reanimated';
import React, { useEffect, useState, Suspense } from 'react';
import { Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { enGB, registerTranslation } from 'react-native-paper-dates';

import { ThemeProvider, useThemeMode } from './components/theme/ThemeProvider';
import UniversalHeader from './components/UniversalHeader';
import AlertCenter from './components/AlertCenter';
import { height, width, WEBSITE_URL } from './components/constants';

/* ---------- EAGER (bootstrap) ---------- */
import Check from './screens/Check';
import Login from './screens/Login';
import Register from './screens/Register';
import WelcomeScreen from './screens/WelcomeScreen';
import Homescreen from './screens/Homescreen';

/* ---------- helper: native lazy, web eager ---------- */
const lazyOrEager = (WebModule, nativeImporter) =>
  Platform.OS === 'web'
    ? (WebModule?.default ?? WebModule) // use eager module on web
    : React.lazy(nativeImporter);       // lazy on native

const withSuspenseIfLazy = (Comp) => {
  // On native, Comp is a real lazy component. On web, it’s a normal function.
  if (Platform.OS === 'web') return Comp;
  return (props) => (
    <Suspense fallback={null}>
      <Comp {...props} />
    </Suspense>
  );
};

registerTranslation('en-GB', enGB);

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [
    Linking.createURL('#/'),
    'http://localhost:8081',
    WEBSITE_URL,
    'https://iasandco.in/',
    'https://iasandco.in',
  ],
  config: {
    initialRouteName: 'Check',
    screens: {
      Check: 'check',
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',

      WelcomeScreen: 'welcomescreen',
      AboutUs: 'about-us',
      Services: 'services',
      ContactUs: 'contact',
      Privacy: 'privacy-policy',

      Homescreen: 'dashboard',
      Dues: 'dues',
      Transactions: 'transactions',
      NeedHelp: 'help',
      Account: 'account',
      Alerts: 'alerts',

      Documents: 'documents',
      DocumentViewer: { path: 'documents/:docId', parse: { docId: String } },
    },
  },
};

function AppInner() {
  const { isDark } = useThemeMode();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer linking={linking}>
        <AlertCenter />
        <Stack.Navigator
          initialRouteName="Check"
          screenOptions={{
            header: () => <UniversalHeader />,
            headerTransparent: true,
            headerTitle: '',
            animation: 'fade',
          }}
        >
          {/* Auth */}
          <Stack.Screen name="Check" component={Check} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
          {/* Landing Pages */}
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Homescreen" component={Homescreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      await Promise.all([AntDesign.loadFont(), Ionicons.loadFont()]);
      setReady(true);
    })();
  }, []);
  if (!ready) return null;

  return (
    <ThemeProvider>
      <View style={{ flex: 1, height, maxWidth: width }}>
        <AppInner />
      </View>
    </ThemeProvider>
  );
}
