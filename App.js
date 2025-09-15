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

// 1) Your mode provider (persisted dark/light/system)
import { ThemeProvider, useThemeMode } from './components/theme/ThemeProvider';

// 2) Design-system tokens provider (colors, spacing, createStyles, variants)
import { ThemeProvider as TokensThemeProvider } from './components/theme/theme';

/* ---------- EAGER (bootstrap) ---------- */
import Check from './screens/Check';
import Login from './screens/Login';
import Register from './screens/Register';
import WelcomeScreen from './screens/WelcomeScreen';
import Homescreen from './screens/Homescreen';
import { height, width } from './components/constants';
import AlertCenter from './components/AlertCenter';
import OnboardingQuestions from './screens/OnboardingQuestions';
import ChatScreen from './screens/ChatScreen';

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
    'https://lightblue-lyrebird-525926.hostingersite.com/',
  ],
  config: {
    initialRouteName: 'Check',
    screens: {
      Check: 'check',
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      WelcomeScreen: 'welcomescreen',
      Homescreen: 'dashboard',
    },
  },
};

function AppInner() {
  // Read the resolved appearance from your simple provider
  const { isDark } = useThemeMode();

  // Feed the tokens provider with a concrete mode
  const tokensMode = isDark ? 'dark' : 'light';

  return (
    <TokensThemeProvider mode={tokensMode}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer linking={linking}>
        <AlertCenter />
        <Stack.Navigator
          initialRouteName="Check"
          screenOptions={{
            headerShown: false,
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
          <Stack.Screen name="OnboardingQuestions" component={OnboardingQuestions} options={{ headerShown: false }} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </TokensThemeProvider>
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
    // Outer: your persisted/system theme controller (ThemeProvider.js)
    <ThemeProvider>
      {/* Inner: your app content, also wrapped by tokens provider in AppInner */}
      <View style={{ flex: 1, height: height, maxWidth: width }}>
        <AppInner />
      </View>
    </ThemeProvider>
  );
}
