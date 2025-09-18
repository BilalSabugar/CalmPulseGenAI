// screens/Check.jsx
import React, { Component } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import isAdmin from '../utils/isAdmin';

// Adjust these if your route names differ:
const ADMIN_SCREEN = 'Admin';
const USER_SCREEN = 'Homescreen';
const LOGGED_OUT_SCREEN = 'Chatscreen'; // or 'Login'

export default class Check extends Component {
  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.bootstrap();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  resetTo = (name, params) => {
    if (!this._isMounted) return;
    this.props.navigation.reset({
      index: 0,
      routes: [{ name, params }],
    });
  };

  bootstrap = async () => {
    try {
      const entries = await AsyncStorage.multiGet(['isAutoLogin', 'isLoggedIn', 'email']);
      const map = Object.fromEntries(entries);
      const email = (map.email || '').trim().toLowerCase();

      // consider either flag as valid login
      const loggedIn = map.isAutoLogin === 'true' || map.isLoggedIn === 'true';

      if (!loggedIn) {
        this.resetTo(LOGGED_OUT_SCREEN);
        return;
      }

      const admin = await isAdmin(email);
      this.resetTo(admin ? ADMIN_SCREEN : USER_SCREEN, { email });
    } catch (err) {
      console.warn('Check: auth check failed', err);
      this.resetTo(LOGGED_OUT_SCREEN);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
