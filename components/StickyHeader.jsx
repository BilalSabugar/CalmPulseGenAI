import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useThemeMode } from './theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDisplayName } from './get';
import logoutUser from './functions/Logout';
import { height, WebsiteNameResponsive } from './constants';
import BounceOnHover from './BounceOnHover';

export const NAV_H = 64;

export default function StickyHeader({
  tabs = ['Your Documents', 'Dues', 'Transactions', 'Need Help?'],
  active = 'Your Documents',
  onTabPress = () => { },
  isLoggedIn = true,
  onLogin = () => { },
}) {
  const navigation = useNavigation();
  const { isDark, toggle } = useThemeMode();
  const [user, setUser] = useState({ name: '', email: '' });
  const { width } = useWindowDimensions();
  const sm = width < height; // breakpoint for collapsing tabs → hamburger

  const tint = isDark ? 'dark' : 'light';
  const [open, setOpen] = useState(false);

  const pal = useMemo(
    () =>
      isDark
        ? {
          // surfaces
          blurFallback: 'rgba(2,6,23,0.55)',
          border: 'rgba(51,65,85,0.6)',
          chipBorder: 'rgba(148,163,184,0.28)',

          // text/colors
          text: '#ffffff',
          muted: '#cbd5e1',
          brandPillBg: '#ffffff',
          brandPillText: '#0f172a',

          // buttons
          primaryBg: '#ffffff',
          primaryText: '#0f172a',
          ghostBg: 'rgba(2,6,23,0.35)',
          iconOnGhost: '#E5E7EB',

          // menu
          menuBg: 'rgba(2,6,23,0.96)',
        }
        : {
          blurFallback: 'rgba(255,255,255,0.75)',
          border: 'rgba(15,23,42,0.12)',
          chipBorder: 'rgba(15,23,42,0.12)',

          text: '#0f172a',
          muted: '#334155',
          brandPillBg: '#0f172a',
          brandPillText: '#ffffff',

          primaryBg: '#0f172a',
          primaryText: '#ffffff',
          ghostBg: 'rgba(255,255,255,0.7)',
          iconOnGhost: '#111827',

          menuBg: 'rgba(255,255,255,0.98)',
        },
    [isDark]
  );

  useEffect(() => {
    (async () => {
      try {
        const email = (await AsyncStorage.getItem('email')) || '';
        const name = (await AsyncStorage.getItem('name')) || '';
        setUser({ name, email });
        const nm = await getDisplayName();
        await AsyncStorage.setItem('name', nm);
        setUser({ name: nm, email });
      } catch {
        // silent fail: keep defaults
      }
    })();
  }, []);

  const handleTabPress = (tab) => {
    onTabPress(tab);
    if (tab === 'Transactions') navigation.navigate('Transactions');
    if (tab === 'Dues') navigation.navigate('Dues');
    if (tab === 'Your Documents') navigation.navigate('Homescreen');
    if (tab === 'Need Help?') navigation.navigate('NeedHelp');
  };

  const handleAuth = () => {
    if (isLoggedIn) {
      logoutUser(navigation);
    } else {
      onLogin();
    }
    setOpen(false);
  };

  return (
    <>
      {/* Sticky / fixed bar */}
      <View
        style={[
          styles.stickyWrap,
          Platform.select({ web: styles.fixedPos, default: styles.absPos }),
        ]}
        pointerEvents="box-none"
      >
        <BlurView
          intensity={40}
          tint={tint}
          experimentalBlurMethod="none"
          style={[
            styles.blurBar,
            {
              backgroundColor: pal.blurFallback, // fallback under low blur support
              borderColor: pal.border,
            },
          ]}
        >
          {/* Left: brand */}
          <BounceOnHover style={styles.brandRow} onPress={() => navigation.navigate('Homescreen')}>
            <View style={[styles.brandPill, { backgroundColor: pal.brandPillBg }]}>
              <Text style={[styles.brandTxt, { color: pal.brandPillText }]}>{WebsiteNameResponsive}</Text>
            </View>
          </BounceOnHover>

          {/* Center: tabs (hidden on small) */}
          <View style={[styles.tabsRow, { display: sm ? 'none' : 'flex' }]}>
            {tabs.map((t) => {
              const isActive = t === active;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => handleTabPress(t)}
                  activeOpacity={0.9}
                  style={[
                    styles.tab,
                    isActive && [
                      styles.tabActive,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.95)' },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.tabTxt,
                      {
                        color: isActive
                          ? isDark
                            ? '#0f172a'
                            : '#ffffff'
                          : isDark
                            ? '#E5E7EB'
                            : '#334155',
                      },
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Right: cluster */}
          <View style={styles.rightRow}>
            {/* Alerts (compact icon on small, full chip on desktop) */}
            {sm ? (
              <TouchableOpacity
                onPress={() => navigation.navigate('Alerts')}
                style={[
                  styles.iconBtn,
                  { backgroundColor: pal.ghostBg, borderColor: pal.chipBorder },
                ]}
                activeOpacity={0.9}
              >
                <Feather name="bell" size={16} color={pal.iconOnGhost} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate('Alerts')}
                style={[
                  styles.alertBtn,
                  { backgroundColor: pal.ghostBg, borderColor: pal.chipBorder },
                ]}
                activeOpacity={0.9}
              >
                <Feather name="bell" size={14} color={pal.iconOnGhost} />
                <Text style={[styles.alertTxt, { color: pal.iconOnGhost }]}>Alerts</Text>
              </TouchableOpacity>
            )}

            {/* Theme toggle */}
            <TouchableOpacity
              onPress={toggle}
              style={[
                styles.modeBtn,
                { backgroundColor: isDark ? '#F8FAFC' : '#0f172a' },
              ]}
              activeOpacity={0.9}
            >
              <Feather name={isDark ? 'sun' : 'moon'} size={16} color={isDark ? '#0f172a' : '#fff'} />
            </TouchableOpacity>

            {/* User + Auth (hidden on small, moved to menu) */}
            {!sm && (
              <>
                <TouchableOpacity
                  style={[
                    styles.userChip,
                    { backgroundColor: isDark ? 'rgba(2,6,23,0.35)' : '#E2E8F0' },
                  ]}
                  onPress={() => navigation.navigate('Account')}
                  activeOpacity={0.9}
                >
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: isDark ? '#E5E7EB' : '#0f172a' },
                    ]}
                  />
                  <View>
                    <Text style={[styles.userName, { color: pal.text }]} numberOfLines={1}>
                      {user.name || 'User'}
                    </Text>
                    <Text style={[styles.userEmail, { color: pal.muted }]} numberOfLines={1}>
                      {user.email || '—'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAuth}
                  activeOpacity={0.9}
                  style={[styles.authBtn, { backgroundColor: pal.primaryBg }]}
                >
                  <Text style={[styles.authTxt, { color: pal.primaryText }]}>
                    {isLoggedIn ? 'Log Out' : 'Login'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Hamburger on small */}
            {sm && (
              <TouchableOpacity
                onPress={() => setOpen(true)}
                style={[
                  styles.iconBtn,
                  { backgroundColor: pal.ghostBg, borderColor: pal.chipBorder },
                ]}
                activeOpacity={0.9}
              >
                <Feather name="menu" size={18} color={pal.iconOnGhost} />
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </View>

      {/* Spacer */}
      <View style={{ height: NAV_H }} />

      {/* Mobile Menu */}
      <Modal
        visible={open}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        <View style={[styles.menuWrap, { top: NAV_H + 8 }]}>
          <View
            style={[
              styles.menuPanel,
              { backgroundColor: pal.menuBg, borderColor: pal.chipBorder },
              Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } : null,
            ]}
          >
            {tabs.map((t) => {
              const isActive = t === active;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    handleTabPress(t);
                    setOpen(false);
                  }}
                  style={styles.menuItem}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.menuText,
                      { color: isActive ? pal.text : pal.muted },
                    ]}
                  >
                    {t}
                  </Text>
                  {isActive && <Feather name="check" size={16} color={pal.text} />}
                </TouchableOpacity>
              );
            })}

            <View style={styles.menuDivider(pal.chipBorder)} />

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Alerts');
                setOpen(false);
              }}
              style={styles.menuItem}
              activeOpacity={0.9}
            >
              <Text style={[styles.menuText, { color: pal.text }]}>Alerts</Text>
              <Feather name="bell" size={16} color={pal.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Account');
                setOpen(false);
              }}
              style={styles.menuItem}
              activeOpacity={0.9}
            >
              <Text style={[styles.menuText, { color: pal.text }]}>Account</Text>
              <Feather name="user" size={16} color={pal.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                toggle();
                setOpen(false);
              }}
              style={styles.menuItem}
              activeOpacity={0.9}
            >
              <Text style={[styles.menuText, { color: pal.text }]}>{isDark ? 'Light mode' : 'Dark mode'}</Text>
              <Feather name={isDark ? 'sun' : 'moon'} size={16} color={pal.text} />
            </TouchableOpacity>

            <View style={styles.menuDivider(pal.chipBorder)} />

            <TouchableOpacity onPress={handleAuth} style={styles.menuItem} activeOpacity={0.9}>
              <Text style={[styles.menuText, { color: pal.text }]}>{isLoggedIn ? 'Log Out' : 'Login'}</Text>
              <Feather name={isLoggedIn ? 'log-out' : 'log-in'} size={16} color={pal.text} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  /* positioning */
  stickyWrap: { zIndex: 1000 },
  fixedPos: { position: 'fixed', top: 0, left: 0, right: 0 }, // web
  absPos: { position: 'absolute', top: 0, left: 0, right: 0 }, // native

  /* blurred bar */
  blurBar: {
    height: NAV_H,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  /* left */
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandPill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  brandTxt: { fontWeight: '900', letterSpacing: 0.3, fontSize: 12 },

  /* center tabs */
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 8,
    paddingHorizontal: 8,
  },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  tabActive: {},
  tabTxt: { fontSize: 13, fontWeight: '700' },

  /* right cluster */
  rightRow: { flexDirection: 'row', alignItems: 'center', columnGap: 8 },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  alertBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTxt: { fontSize: 12, fontWeight: '600' },

  modeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: 210,
  },
  avatar: { width: 20, height: 20, borderRadius: 10 },
  userName: { fontSize: 12, fontWeight: '700' },
  userEmail: { fontSize: 10 },

  authBtn: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  authTxt: { fontWeight: '700', fontSize: 12 },

  /* mobile menu */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.35)',
  },
  menuWrap: {
    position: 'absolute',
    right: 12,
    left: 12,
    alignItems: 'flex-end',
  },
  menuPanel: {
    minWidth: 240,
    borderWidth: 1,
    borderRadius: 14,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    gap: 2,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-between',
  },
  menuText: { fontSize: 14, fontWeight: '600' },
  menuDivider: (c) => ({ height: 1, backgroundColor: c, marginVertical: 6 }),
});
