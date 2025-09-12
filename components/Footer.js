// Footer.js (ICAI-compliant, centralized styles + content)
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BouncyIcon from './BouncyIcon';
import BounceOnHover from './BounceOnHover';

// Centralized styles + content
import { buildPalette, components, typography, layout } from '../src/styles';
import { app, nav, actions, footer as footerText, contact as contactText } from '../src/content';

// Social/branding links you already keep in constants (safe to retain)
import {
  BULLET_POINT,
  DEVELOPER_WEBSITE,
  DEVELOPERNAME,
  FA,
  INSTA,
  LINKEDIN,
  TWITTER,
  WA,
} from './constants';

const Footer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const P = useMemo(() => buildPalette(colorScheme === 'dark'), [colorScheme]);

  const [isLogged, setIsLogged] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('isLogedIn');
        setIsLogged(flag === 'true');
      } catch {
        setIsLogged(null);
      }
    })();
  }, []);

  const openURL = (url) => Linking.openURL(url);
  const callHref = `tel:${String(contactText.phone || '').replace(/\s/g, '')}`;
  const mailHref = `mailto:${contactText.email}`;

  return (
    <View style={[styles.wrap(P)]}>
      {/* ICAI-neutral CTA band */}
      <View style={[components.card, styles.cardBorder(P), styles.row, { marginHorizontal: 16, gap: 12 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h2, { color: P.heading }]}>{footerText.heading}</Text>
          <Text style={[typography.sub, { color: P.subdued, marginTop: 4 }]}>
            {footerText.sub}
          </Text>
        </View>
        <View style={[layout.ctaRow, { marginTop: 0 }]}>
          <TouchableOpacity
            onPress={() => openURL(callHref)}
            style={[components.ctaPrimary, { backgroundColor: P.ctaPrimaryBg }]}
            activeOpacity={0.9}
          >
            <Feather name="phone-call" size={14} color={P.ctaPrimaryText} />
            <Text style={[typography.ctaPrimaryText, { color: P.ctaPrimaryText }]}>{actions.call}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openURL(mailHref)}
            style={[components.ctaGhost, { borderColor: P.ctaGhostBorder }]}
            activeOpacity={0.9}
          >
            <Feather name="mail" size={14} color={P.ctaGhostText} />
            <Text style={[typography.ctaGhostText, { color: P.ctaGhostText }]}>{actions.email}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Columns */}
      <View style={[components.card, styles.cardBorder(P), styles.columns]}>
        {/* Brand + socials */}
        <View style={styles.col}>
          <View style={styles.brandPill}>
            <Text style={[styles.brandTxt, { color: P.heading }]}>{app.websiteName}</Text>
          </View>
          <Text style={[styles.tagline, { color: P.text }]}>Chartered Accountants</Text>

          <Text style={[styles.h, { color: P.heading, marginTop: 14 }]}>{footerText.followUs}</Text>
          <View style={styles.socialRow}>
            {FA && <BouncyIcon onPress={() => openURL(FA)} source={require('../assets/facebook.png')} />}
            {WA && <BouncyIcon onPress={() => openURL(WA)} source={require('../assets/whatsapp.png')} />}
            {INSTA && <BouncyIcon onPress={() => openURL(INSTA)} source={require('../assets/instagram.png')} />}
            {TWITTER && <BouncyIcon onPress={() => openURL(TWITTER)} source={require('../assets/twitter.png')} />}
            {LINKEDIN && <BouncyIcon onPress={() => openURL(LINKEDIN)} source={require('../assets/linkedin.png')} />}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.col}>
          <Text style={[styles.h, { color: P.heading }]}>{footerText.contact}</Text>
          <Line
            icon="phone"
            text={contactText.phone}
            onPress={() => openURL(callHref)}
            P={P}
          />
          <Line
            icon="mail"
            text={contactText.email}
            onPress={() => openURL(mailHref)}
            P={P}
          />
          {/* Address displayed as informational text (no map pin link) */}
          <Line icon="map-pin" text={contactText.address} multiline P={P} />
          <Line
            icon="clock"
            text={contactText.officeTime}
            // onPress={() => openURL(mailHref)}
            P={P}
          />
        </View>

        {/* Useful Links */}
        <View style={styles.col}>
          <Text style={[styles.h, { color: P.heading }]}>{footerText.usefulLinks}</Text>

          {route.name !== 'WelcomeScreen' && (
            <BounceOnHover onPress={() => navigation.navigate('WelcomeScreen')}>
              <Text style={[styles.linkRowTxt, { color: P.text }]}>{BULLET_POINT} {nav.home}</Text>
            </BounceOnHover>
          )}
          {route.name !== 'Login' && isLogged === false && (
            <BounceOnHover onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.linkRowTxt, { color: P.text }]}>{BULLET_POINT} {nav.login}</Text>
            </BounceOnHover>
          )}
          <BounceOnHover onPress={() => navigation.navigate('AboutUs')}>
            <Text style={[styles.linkRowTxt, { color: P.text }]}>{BULLET_POINT} {nav.about}</Text>
          </BounceOnHover>
          <BounceOnHover onPress={() => navigation.navigate('Services')}>
            <Text style={[styles.linkRowTxt, { color: P.text }]}>{BULLET_POINT} {nav.services}</Text>
          </BounceOnHover>
          <BounceOnHover onPress={() => navigation.navigate('ContactUs')}>
            <Text style={[styles.linkRowTxt, { color: P.text }]}>{BULLET_POINT} {nav.contact}</Text>
          </BounceOnHover>
        </View>

        {/* Legal */}
        <View style={styles.col}>
          <Text style={[styles.h, { color: P.heading }]}>{footerText.legal}</Text>
          <BounceOnHover onPress={() => navigation.navigate('Privacy')} activeOpacity={0.8} style={styles.linkRow}>
            <Feather name="file-text" size={14} color={P.subdued} />
            <Text style={[styles.link, { color: P.text }]}>{footerText.termsPrivacy}</Text>
          </BounceOnHover>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.hr, { backgroundColor: P.cardBorder }]} />

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Text style={[styles.copy, { color: P.footerText }]}>
          {footerText.copyrightPrefix} {new Date().getFullYear()} {app.websiteName} All rights reserved.
        </Text>
        <TouchableOpacity
          onPress={() => openURL(DEVELOPER_WEBSITE)}
          activeOpacity={0.8}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Text style={[styles.copy, { color: P.footerText, opacity: 0.9 }]}>{footerText.developedByPrefix}</Text>
          <Text style={[styles.copy, { color: P.link, fontWeight: '700' }]}>{DEVELOPERNAME}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Footer;

/* ---------- small atoms ---------- */
function Line({ icon, text, onPress, multiline, P }) {
  const s = StyleSheet.create({
    row: { flexDirection: 'row', gap: 8, marginTop: 10, maxWidth: 520 },
    t: { color: P.text, fontSize: 13, lineHeight: 20, flexShrink: 1 },
    link: { color: P.link, textDecorationLine: 'underline' },
  });
  const content = (
    <Text style={s.t} numberOfLines={multiline ? 0 : 2}>
      {text}
    </Text>
  );
  return (
    <View style={s.row}>
      <Feather name={icon} size={14} color={P.text} />
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <Text style={[s.t, s.link]} numberOfLines={multiline ? 0 : 2}>
            {text}
          </Text>
        </TouchableOpacity>
      ) : (
        content
      )}
    </View>
  );
}

/* ---------- local layout glue (uses centralized palette) ---------- */
const styles = {
  wrap: (P) => ({
    backgroundColor: P.pageBg,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'web' ? 28 : 18,
    borderTopWidth: 1,
    borderTopColor: P.footerBorder,
    width: '100%',
  }),

  cardBorder: (P) => ({
    backgroundColor: P.cardBg,
    borderColor: P.cardBorder,
  }),

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  columns: {
    marginTop: 16,
    marginHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    justifyContent: 'space-between',
  },

  col: { minWidth: 220, flexShrink: 1, flexGrow: 1 },

  brandPill: { alignSelf: 'flex-start' },
  brandTxt: { fontSize: 18, fontWeight: '900' },
  tagline: { fontSize: 16, fontWeight: '800', marginTop: 8 },

  h: { fontSize: 14, fontWeight: '800', marginTop: 6, marginBottom: 8 },

  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  link: { fontSize: 13 },
  linkRowTxt: { fontSize: 13, marginTop: 8 },

  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },

  hr: {
    height: 1,
    marginHorizontal: 16,
    marginTop: 14,
    opacity: 0.7,
  },

  bottomBar: {
    marginTop: 12,
    marginHorizontal: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: { fontSize: 12 },
};
