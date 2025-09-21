import 'react-native-reanimated';
import React, { useEffect, useState, Suspense } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { enGB, registerTranslation } from 'react-native-paper-dates';

import { ThemeProvider, useThemeMode } from './components/theme/ThemeProvider';
import { ThemeProvider as TokensThemeProvider } from './components/theme/theme';

import Check from './screens/Check';
import Login from './screens/Login';
import Register from './screens/Register';
import WelcomeScreen from './screens/WelcomeScreen';
import Homescreen from './screens/Homescreen';
import { height, width } from './components/constants';
import OnboardingQuestions from './screens/OnboardingQuestions';
import ChatScreen from './screens/ChatScreen'
import AboutUs from './screens/AboutUs';
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
      OnboardingQuestions: 'onboardingquestions',
      ChatScreen: 'chatscreen',
    },
  },
};

function AppInner() {
  const { isDark } = useThemeMode();

  const tokensMode = isDark ? 'dark' : 'light';

  return (
    <TokensThemeProvider mode={tokensMode}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer linking={linking}>
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

          {/* Pages */}
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AboutUs" component={AboutUs} options={{ headerShown: false }} />
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
    <ThemeProvider>
      <View style={{ flex: 1, height: height, maxWidth: width }}>
        <AppInner />
      </View>
    </ThemeProvider>
  );
}