// // ================================
// // File: screens/ForgotPassword.jsx
// // Description: Forgot Password screen with Firebase reset email logic (RN + RN Web)
// // ================================
// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
// import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
// import { Feather } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';

// export default function ForgotPassword({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [statusMsg, setStatusMsg] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleReset = async () => {
//     if (!email.trim()) return;
//     setLoading(true);
//     setStatusMsg('');
//     try {
//       const auth = getAuth();
//       await sendPasswordResetEmail(auth, email.trim().toLowerCase());
//       setStatusMsg('Password reset link sent to your email.');
//     } catch (e) {
//       setStatusMsg('Unable to send reset email. Please check your email address.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={s.wrap}>
//       <LinearGradient colors={['#020617', '#0b1220', '#020617']} style={StyleSheet.absoluteFill} />
//       <View style={s.center}>
//         <Text style={s.title}>Forgot Password</Text>
//         <Text style={s.sub}>Enter your registered email to receive a password reset link.</Text>

//         <View style={s.inputWrap}>
//           <Feather name="mail" size={16} color="#93c5fd" />
//           <TextInput
//             value={email}
//             onChangeText={setEmail}
//             placeholder="Email address"
//             placeholderTextColor="#8b9bb2"
//             keyboardType="email-address"
//             autoCapitalize="none"
//             style={s.input}
//           />
//         </View>

//         {statusMsg ? <Text style={s.status}>{statusMsg}</Text> : null}

//         <TouchableOpacity
//           disabled={!email.trim() || loading}
//           onPress={handleReset}
//           style={[s.btn, (!email.trim() || loading) && { opacity: 0.5 }]}
//         >
//           <Text style={s.btnTxt}>{loading ? 'Sending…' : 'Send Reset Link'}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={s.linkTxt}>Back to Login</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   wrap: { flex: 1, backgroundColor: '#0b1220' },
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18 },
//   title: { color: '#e5e7eb', fontSize: 24, fontWeight: '800' },
//   sub: { color: '#cbd5e1', marginTop: 6, textAlign: 'center', lineHeight: 20 },
//   inputWrap: {
//     marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 10,
//     borderWidth: 1, borderColor: 'rgba(148,163,184,0.35)', backgroundColor: 'rgba(2, 6, 23, 0.5)',
//     borderRadius: 12, paddingHorizontal: 12, height: 44,
//   },
//   input: { flex: 1, color: '#e5e7eb', paddingVertical: Platform.OS === 'web' ? 8 : 4 },
//   btn: {
//     marginTop: 16, backgroundColor: '#22d3ee', height: 44, borderRadius: 12,
//     alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16,
//   },
//   btnTxt: { color: '#0b1220', fontWeight: '800' },
//   linkTxt: { color: '#93c5fd', textDecorationLine: 'underline', marginTop: 20 },
//   status: { color: '#93c5fd', marginTop: 10, textAlign: 'center' },
// });

// ================================
// File: screens/ForgotPassword.jsx
// Description: Password reset (RN + Web via Expo). Uses Firebase Auth and ConfirmModal.
// ================================
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import ConfirmModal from '../components/ConfirmModal';
import { width } from '../components/constants';

// Optional: if you have a custom redirect URL for web, set actionCodeSettings here
// const actionCodeSettings = {
//   url: 'https://yourapp.example.com/login',
//   handleCodeInApp: false,
// };

export default function ForgotPassword({ navigation }) {
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [okOpen, setOkOpen] = useState(false);

    const [cooldown, setCooldown] = useState(0); // seconds left
    const cooldownRef = useRef(null);

    // Subtle background motion
    const glow = useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glow, { toValue: 1, duration: 3500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(glow, { toValue: 0, duration: 3500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ]),
        ).start();
        return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
    }, [glow]);

    const canSubmit = useMemo(() => /.+@.+\..+/.test(email.trim()) && cooldown === 0 && !busy, [email, cooldown, busy]);

    const startCooldown = (sec = 60) => {
        setCooldown(sec);
        cooldownRef.current && clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setCooldown((s) => {
                if (s <= 1) { clearInterval(cooldownRef.current); return 0; }
                return s - 1;
            });
        }, 1000);
    };

    const sendReset = async () => {
        if (!canSubmit) return;
        setBusy(true);
        setErrorMsg('');
        const auth = getAuth();
        try {
            // If you use multi-language templates:
            // auth.languageCode = 'en';
            await sendPasswordResetEmail(auth, email.trim().toLowerCase()/**, actionCodeSettings **/);
            setOkOpen(true);
            startCooldown(60);
        } catch (e) {
            const msg = mapFirebaseError(e?.code);
            setErrorMsg(msg);
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={fp.wrap}>
            <LinearGradient colors={['#020617', '#0b1220', '#020617']} start={{ x: 0.1, y: 0.1 }} end={{ x: 0.9, y: 1 }} style={fp.bg} />
            <Animated.View style={[fp.glow, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.14] }) }]} />

            <View style={fp.center}>
                <BlurView intensity={Platform.OS === 'ios' ? 40 : 60} tint="dark" style={fp.card}>
                    <View style={{ gap: 12 }}>
                        <View style={fp.logoRow}>
                            <View style={fp.logoBox}><Text style={fp.logo}>IAS & Co.</Text></View>
                            <Text style={fp.logoSub}>Chartered Accountants</Text>
                        </View>

                        <Text style={fp.title}>Reset your password</Text>
                        <Text style={fp.sub}>Enter the email associated with your account. We’ll send a secure reset link.</Text>

                        <View style={fp.inputWrap}>
                            <Feather name="mail" size={16} color="#93c5fd" />
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email address"
                                placeholderTextColor="#8b9bb2"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={fp.input}
                                autoCorrect={false}
                                autoComplete="email"
                                textContentType="username"
                            />
                        </View>

                        {errorMsg ? <Text style={fp.error}>{errorMsg}</Text> : null}

                        <TouchableOpacity disabled={!canSubmit} onPress={sendReset} activeOpacity={0.9} style={[fp.btn, !canSubmit && { opacity: 0.5 }]}>
                            <Feather name="send" size={16} color="#0b1220" />
                            <Text style={fp.btnTxt}>{busy ? 'Sending…' : cooldown > 0 ? `Retry in ${cooldown}s` : 'Send reset link'}</Text>
                        </TouchableOpacity>

                        <View style={fp.rowBetween}>
                            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={fp.linkTxt}>Back</Text></TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </View>

            {/* Success modal (reuse ConfirmModal) */}
            <ConfirmModal
                visible={okOpen}
                onClose={() => setOkOpen(false)}
                title="Check your inbox"
                message={`We sent a password reset link to
${email.trim()}. Follow the instructions to create a new password. If you don’t see it, check spam.`}
                confirmText="Open Mail app"
                onConfirm={() => {
                    setOkOpen(false);
                    // On native, you can integrate Linking.openURL('message:') or a mail app URL if needed.
                }}
            />
        </View>
    );
}

function mapFirebaseError(code) {
    switch (code) {
        case 'auth/invalid-email': return 'The email address is not valid.';
        case 'auth/user-not-found': return 'No user found with this email.';
        case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
        default: return 'Could not send reset email. Please try again.';
    }
}

const fp = StyleSheet.create({
    wrap: { flex: 1, backgroundColor: '#0b1220', maxWidth: width, overflow: "hidden" },
    bg: { ...StyleSheet.absoluteFillObject },
    glow: { position: 'absolute', left: -80, right: -80, top: -60, bottom: -60, backgroundColor: '#22d3ee' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18 },
    card: { width: '100%', maxWidth: 720, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)', overflow: 'hidden' },
    logoRow: { flexDirection: 'column', alignItems: 'flex-start' },
    logoBox: { backgroundColor: '#0b1220', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    logo: { color: '#e5e7eb', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
    logoSub: { color: '#93c5fd', opacity: 0.8 },
    title: { color: '#e5e7eb', fontSize: 24, fontWeight: '800', marginTop: 10 },
    sub: { color: '#bcd0ea', marginTop: 6, lineHeight: 20 },
    inputWrap: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(148,163,184,0.35)', backgroundColor: 'rgba(2, 6, 23, 0.5)', borderRadius: 12, paddingHorizontal: 12, height: 44 },
    input: { flex: 1, color: '#e5e7eb', paddingVertical: Platform.OS === 'web' ? 8 : 4 },
    btn: { marginTop: 14, backgroundColor: '#22d3ee', height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
    btnTxt: { color: '#0b1220', fontWeight: '800', fontSize: 15, letterSpacing: 0.2 },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
    linkTxt: { color: '#93c5fd', textDecorationLine: 'underline' },
    error: { color: '#fecaca', marginTop: 8 },
});
