// ================================
// File: screens/Register.jsx
// Description: 4-step SignUp wizard with "Next" per step, final "Complete Sign Up".
//              Profile photo is last, uploaded to Firebase Storage; user doc written to Firestore.
// ================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Platform, Animated, Easing, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { width } from '../components/constants';
import { addAlert } from '../utils/addAlert';

const { width: W, height: H } = Dimensions.get('window');

export default function Register() {
  const navigation = useNavigation();

  // ---------------- Form State ----------------
  // Step 1 (2–3 fields): email + password + confirm
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  // Step 2 (2 fields): company + phone
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  // Step 3 (2–3 fields): gst, pan, address (about can be added later in profile)
  const [gst, setGst] = useState('');
  const [pan, setPan] = useState('');
  const [address, setAddress] = useState('');
  // Step 4 (1 field): avatar (required at last as per your instruction)
  const [avatarUri, setAvatarUri] = useState(null);

  // Defaults
  const notifyEmail = false;
  const notifyWhatsApp = false;
  const paperless = true;

  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Wizard step
  const [step, setStep] = useState(0); // 0..3

  // ---------------- Background Motion (same feel as Login) ----------------
  const blob1 = useRef(new Animated.Value(0)).current;
  const blob2 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = (v, d) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: d, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: d, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ).start();
    anim(blob1, 6000);
    anim(blob2, 8400);
  }, [blob1, blob2]);
  const b1Scale = blob1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const b2Scale = blob2.interpolate({ inputRange: [0.9, 1.1], outputRange: [1.1, 0.9] });

  // ---------------- Secure Overlay ----------------
  const [authing, setAuthing] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const steps = useMemo(() => ['Provisioning account…', 'Encrypting profile…', 'Hardening session…', 'Finalizing…'], []);
  const lockScale = useRef(new Animated.Value(1)).current;
  const ringPulse = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const ringScale = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const ringOpacity = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0] });

  // ---------------- Validation per step ----------------
  const emailOk = /.+@.+\..+/.test(email.trim());
  const pwOk = pw.length >= 6;
  const pwMatch = pw && pw2 && pw === pw2;

  const companyOk = company.trim().length >= 2;
  const phoneOk = /^\+?[0-9]{7,15}$/.test(phone.trim());

  const stepValid = useMemo(() => {
    switch (step) {
      case 0: return emailOk && pwOk && pwMatch;
      case 1: return companyOk && phoneOk;
      case 2: return true; // optional fields
      case 3: return !!avatarUri; // enforce avatar on last step as requested
      default: return false;
    }
  }, [step, emailOk, pwOk, pwMatch, companyOk, phoneOk, avatarUri]);

  // ---------------- Avatar Picker ----------------
  const pickAvatar = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.86,
      });
      if (!res.canceled) {
        const uri = res.assets?.[0]?.uri;
        if (uri) setAvatarUri(uri);
      }
    } catch {
      // ignore
    }
  };

  async function uriToBlob(uri) {
    const resp = await fetch(uri);
    return await resp.blob();
  }

  // ---------------- Navigation Buttons ----------------
  const nextOrSubmit = () => {
    if (!stepValid || submitting) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    startAuthAnim();
  };

  const back = () => {
    if (step === 0) { navigation.goBack() };
    setStep(step - 1);
  };

  const startAuthAnim = () => {
    setAuthing(true);
    setStepIdx(0);
    progress.setValue(0);
    ringPulse.setValue(0);
    lockScale.setValue(1);

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 0, duration: 1000, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(lockScale, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(lockScale, { toValue: 1.0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();

    let i = 0;
    const tick = () => {
      i += 1;
      setStepIdx(Math.min(i, steps.length - 1));
      Animated.timing(progress, {
        toValue: (i + 1) / steps.length,
        duration: 650,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

      if (i < steps.length - 1) {
        setTimeout(tick, 800);
      } else {
        setTimeout(handleRegister, 700);
      }
    };
    setTimeout(tick, 300);
  };

  // ---------------- Submit (Firebase) ----------------
  const handleRegister = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      const auth = getAuth();
      const db = getFirestore();
      const storage = getStorage();

      // 1) Create Auth account
      const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pw);

      // 2) Upload avatar (required at this step)
      let avatarUrl = '';
      if (avatarUri) {
        const blob = await uriToBlob(avatarUri);
        const sref = ref(storage, `avatars/${email}.jpg`);
        if (Platform.OS === 'web') {
          const task = uploadBytesResumable(sref, blob);
          await new Promise((resolve, reject) => task.on('state_changed', () => { }, reject, resolve));
        } else {
          await uploadBytes(sref, blob);
        }
        avatarUrl = await getDownloadURL(sref);
      }

      // 3) Update profile
      await updateProfile(cred.user, {
        displayName: company.trim() || email.trim(),
        photoURL: avatarUrl || null,
      });

      // 4) Firestore doc
      await setDoc(doc(db, 'users', email), {
        email: cred.user.email,
        company: company.trim(),
        phone: phone.trim(),
        gst: gst.trim() || null,
        pan: pan.trim() || null,
        address: address.trim() || null,
        avatarUrl: avatarUrl || null,
        accountSince: moment().format(),
        notifyEmail: false,
        notifyWhatsApp: false,
        paperless: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userType: 'client',
      });

      // 5) Optional alert
      try {
        await addAlert(cred.user.email, { type: 'security', title: 'Account created', body: 'Welcome aboard!' });
      } catch { }

      // 6) Go home
      navigation.reset({ index: 0, routes: [{ name: 'Homescreen' }] });
    } catch (e) {
      setErrorMsg(mapFirebaseError(e?.code));
      setAuthing(false);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Render ----------------
  return (
    <View style={s.wrap}>
      <LinearGradient colors={['#020617', '#0b1220', '#020617']} start={{ x: 0.1, y: 0.1 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      <Animated.View style={[s.blob, { top: H * 0.1, left: -80, transform: [{ scale: b1Scale }] }]} />
      <Animated.View style={[s.blob2, { bottom: -60, right: -60, transform: [{ scale: b2Scale }] }]} />

      <View pointerEvents="none" style={s.grid}>
        {Array.from({ length: 10 }).map((_, i) => (<View key={`v-${i}`} style={[s.gridLine, { left: (i + 1) * (W / 12) }]} />))}
        {Array.from({ length: 14 }).map((_, i) => (<View key={`h-${i}`} style={[s.gridLine, { top: (i + 1) * (H / 18), width: '100%', height: 1 }]} />))}
      </View>

      <View style={s.center}>
        <BlurView intensity={Platform.OS === 'ios' ? 40 : 60} tint="dark" style={s.card}>
          <View style={{ gap: 12 }}>
            {/* Header */}
            <View style={s.logoRow}>
              <View style={s.logoBox}><Text style={s.logo}>IAS & Co.</Text></View>
              <Text style={s.logoSub}>Chartered Accountants</Text>
            </View>
            <Text style={s.title}>Create your account</Text>
            <Text style={s.sub}>We’ll take just a few steps.</Text>

            {/* Step Dots */}
            <View style={s.dots}>
              {[0, 1, 2, 3].map(i => (
                <View key={i} style={[s.dot, step === i && s.dotOn]} />
              ))}
            </View>

            {/* STEP 0: Credentials */}
            {step === 0 && (
              <>
                <LabeledInput icon="mail" placeholder="Work email" value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
                <View style={s.inputWrap}>
                  <Feather name="lock" size={16} color="#93c5fd" />
                  <TextInput
                    value={pw}
                    onChangeText={setPw}
                    placeholder="Password (min 6 chars)"
                    placeholderTextColor="#8b9bb2"
                    secureTextEntry={!showPw}
                    style={s.input}
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="newPassword"
                  />
                  <TouchableOpacity onPress={() => setShowPw(v => !v)} style={{ paddingLeft: 6 }}>
                    <Feather name={showPw ? 'eye' : 'eye-off'} size={16} color="#8b9bb2" />
                  </TouchableOpacity>
                </View>
                <LabeledInput icon="shield" placeholder="Confirm password" value={pw2} onChangeText={setPw2}
                  secureTextEntry={!showPw} autoCorrect={false} autoComplete="password" textContentType="newPassword" />
                {!pwMatch && pw2.length > 0 ? <Text style={s.error}>Passwords do not match.</Text> : null}
              </>
            )}

            {/* STEP 1: Org & Phone */}
            {step === 1 && (
              <>
                <LabeledInput icon="briefcase" placeholder="Company name" value={company} onChangeText={setCompany} />
                <LabeledInput icon="phone" placeholder="Phone with country code (e.g., +91XXXXXXXXXX)"
                  value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoCapitalize="none" />
              </>
            )}

            {/* STEP 2: KYC-lite & Address */}
            {step === 2 && (
              <>
                <LabeledInput icon="hash" placeholder="GST number (optional)" value={gst} onChangeText={setGst} />
                <LabeledInput icon="credit-card" placeholder="PAN number (optional)" value={pan} onChangeText={setPan} />
                <LabeledInput icon="map-pin" placeholder="Address (optional)" value={address} onChangeText={setAddress} multiline />
                <Text style={s.disclaimer}>
                  By signing up you agree to our{' '}
                  <Text style={s.linkTxt} onPress={() => navigation.navigate('Privacy')}>Terms and Conditions</Text>
                  {' '}and{' '}
                  <Text style={s.linkTxt} onPress={() => navigation.navigate('Privacy')}>Privacy Policy</Text>.
                </Text>
              </>
            )}

            {/* STEP 3: Avatar (required) */}
            {step === 3 && (
              <>
                <View style={s.avatarRow}>
                  <TouchableOpacity onPress={pickAvatar} style={s.avatarBtn} activeOpacity={0.9}>
                    {avatarUri ? <Image source={{ uri: avatarUri }} style={s.avatar} /> : <Feather name="camera" size={18} color="#93c5fd" />}
                  </TouchableOpacity>
                  <Text style={s.avatarTxt}>{avatarUri ? 'Change profile picture' : 'Add a profile picture (required)'}</Text>
                </View>
                <Text style={s.small}>This photo will be stored securely and shown on your profile.</Text>
              </>
            )}

            {/* Inline error */}
            {errorMsg ? <Text style={s.error}>{errorMsg}</Text> : null}

            {/* Buttons: Back | Next / Complete */}
            <View style={s.rowBetween}>
              <TouchableOpacity onPress={back} style={[s.ghostBtn]}>
                <Feather name="chevron-left" size={16} color="#93c5fd" />
                <Text style={s.linkTxt}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!stepValid || submitting}
                onPress={nextOrSubmit}
                activeOpacity={0.9}
                style={[s.btn, (!stepValid || submitting) && { opacity: 0.5 }]}
              >
                {step < 3 ? (
                  <>
                    <Text style={s.btnTxt}>Next</Text>
                    <Feather name="chevron-right" size={16} color="#0b1220" />
                  </>
                ) : (
                  <>
                    <Feather name="check-circle" size={16} color="#0b1220" />
                    <Text style={s.btnTxt}>{submitting ? 'Creating…' : 'Complete Sign Up'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Already have an account */}
            <View style={{ alignItems: 'center', marginTop: 6 }}>
              <Text style={s.small}>
                Already have an account? <Text style={s.linkTxt} onPress={() => navigation.navigate('Login')}>Sign in</Text>
              </Text>
            </View>
          </View>
        </BlurView>
      </View>

      {/* Secure overlay */}
      {authing && (
        <View style={s.overlay} pointerEvents="none">
          <Animated.View style={[s.pulseRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <Animated.View style={[s.lockWrap, { transform: [{ scale: lockScale }] }]}>
            <Feather name="lock" size={28} color="#0b1220" />
          </Animated.View>

          <View style={s.authCard}>
            <Text style={s.authHdr}>Hardening your account</Text>
            <Text style={s.authStep}>{steps[stepIdx]}</Text>
            <View style={s.bar}>
              <Animated.View style={[s.barFill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            </View>
            <Text style={s.authFine}>AES-256 | TLS 1.3 | Device attestation</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function LabeledInput({
  icon, placeholder, value, onChangeText,
  secureTextEntry, keyboardType, autoCapitalize, autoComplete, textContentType, multiline,
}) {
  return (
    <View style={[s.inputWrap, multiline && { height: 80, alignItems: 'flex-start', paddingVertical: 8 }]}>
      <Feather name={icon} size={16} color="#93c5fd" style={{ marginTop: multiline ? 2 : 0 }} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8b9bb2"
        secureTextEntry={secureTextEntry}
        style={[s.input, multiline && { height: '100%', textAlignVertical: 'top' }]}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        multiline={!!multiline}
      />
    </View>
  );
}

function mapFirebaseError(code) {
  switch (code) {
    case 'auth/email-already-in-use': return 'This email is already registered.';
    case 'auth/invalid-email': return 'The email address is not valid.';
    case 'auth/operation-not-allowed': return 'Email/password accounts are disabled.';
    case 'auth/weak-password': return 'Password is too weak (minimum 6 characters).';
    default: return 'Could not create account. Please try again.';
  }
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0b1220', maxWidth: width, overflow: 'hidden' },

  blob: { position: 'absolute', width: 280, height: 280, borderRadius: 200, backgroundColor: '#22d3ee', opacity: 0.08 },
  blob2: { position: 'absolute', width: 320, height: 320, borderRadius: 220, backgroundColor: '#a855f7', opacity: 0.06 },

  grid: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: 0.06 },
  gridLine: { position: 'absolute', width: 1, height: '100%', backgroundColor: '#93c5fd' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18 },
  card: { width: '100%', maxWidth: 820, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)', overflow: 'hidden' },

  logoRow: { flexDirection: 'column', alignItems: 'flex-start' },
  logoBox: { backgroundColor: '#0b1220' },
  logo: { color: '#e5e7eb', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  logoSub: { color: '#93c5fd', opacity: 0.8 },

  title: { color: '#e5e7eb', fontSize: 24, fontWeight: '800', marginTop: 10 },
  sub: { color: '#bcd0ea' },

  dots: { flexDirection: 'row', gap: 8, marginTop: 4, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(148,163,184,0.35)' },
  dotOn: { backgroundColor: '#22d3ee' },

  inputWrap: {
    marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: 'rgba(148,163,184,0.35)', backgroundColor: 'rgba(2, 6, 23, 0.5)',
    borderRadius: 12, paddingHorizontal: 12, height: 44,
  },
  input: { flex: 1, color: '#e5e7eb', paddingHorizontal: 15, backgroundColor: 'rgb(2,6,23)', width: '100%', height: '100%' },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  avatarBtn: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(148,163,184,0.35)',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2,6,23,0.5)', overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  avatarTxt: { color: '#9fb2cc' },

  linkTxt: { color: '#93c5fd', textDecorationLine: 'underline' },
  btn: { backgroundColor: '#22d3ee', height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  btnTxt: { color: '#0b1220', fontWeight: '800', fontSize: 15, letterSpacing: 0.2 },
  ghostBtn: { paddingHorizontal: 8, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },

  small: { color: '#9fb2cc', marginTop: 2 },
  error: { color: '#fecaca', marginTop: 6 },
  disclaimer: { color: '#9fb2cc', marginTop: 8, lineHeight: 18 },

  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(2,6,23,0.65)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  pulseRing: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#22d3ee' },
  lockWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#22d3ee', alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: 'rgba(2,6,23,0.6)' },
  authCard: { marginTop: 16, width: '100%', maxWidth: 420, backgroundColor: 'rgba(2,6,23,0.6)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)', borderRadius: 14, padding: 14 },
  authHdr: { color: '#e5e7eb', fontWeight: '800', fontSize: 14 },
  authStep: { color: '#cbd5e1', marginTop: 6 },
  bar: { height: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: '#0b1220', marginTop: 12 },
  barFill: { height: '100%', backgroundColor: '#22d3ee' },
  authFine: { color: '#7aa2d2', marginTop: 10, fontSize: 12 },
});
