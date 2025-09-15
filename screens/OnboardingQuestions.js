import React, { useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '../components/theme/ThemeProvider';
import { sampleQuestions } from '../src/questions';

let LottieView = null;

try {
    if (Platform.OS === 'web') {
        const mod = require('lottie-react');         
        LottieView = mod.default || mod;
    } else {
        const mod = require('lottie-react-native');    
        LottieView = mod.default || mod;
    }
} catch (e) {
    LottieView = null;
}


const HELP_TOPICS = [
    'Anxiety', 'Stress', 'Sleep', 'Confidence', 'Focus / Study',
    'Mood Swings', 'Relationships', 'Motivation', 'Habits', 'General Well-being',
];

export default function OnboardingQuestions() {
    const nav = useNavigation();
    const { isDark } = useThemeMode();

    const c = getColors(isDark);
    const styles = makeStyles(c);

    const questions = useMemo(() => sampleQuestions(10), []);

    const [age, setAge] = useState('');
    const [gender, setGender] = useState(null);             
    const [needs, setNeeds] = useState([]);              
    const canNextFromProfile = age?.trim() && gender && needs.length > 0;

    const totalSteps = questions.length;         
    const [step, setStep] = useState(0);                
    const [answers, setAnswers] = useState({});        

    const onToggleNeed = (n) =>
        setNeeds((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));

    const onNext = () => {
        if (step === 0 && !canNextFromProfile) return;
        if (step < totalSteps) setStep((s) => s + 1);
    };
    const onBack = () => step > 0 && setStep((s) => s - 1);

    const progress = (step / totalSteps) * 100;
    const progAnim = useRef(new Animated.Value(progress)).current;
    React.useEffect(() => {
        Animated.timing(progAnim, {
            toValue: progress,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [progress, progAnim]);

    const [evaluating, setEvaluating] = useState(false);
    const [phase, setPhase] = useState('Understanding you…');

    async function handleEvaluate() {
        const payload = {
            profile: {
                age: Number(age),
                gender,
                needs,
            },
            responses: questions.map((q) => ({
                id: q.id,
                category: q.category,
                question: q.text,
                answer: answers[q.id] || '',
            })),
            meta: {
                device: Platform.OS,
                ts: Date.now(),
                version: 'v1',
            },
        };

        setEvaluating(true);
        setPhase('Understanding you…');
        await delay(1200);
        setPhase('Finding patterns…');
        await delay(900);
        setPhase('Generating personalized experience…');
        await delay(1200);

        const evaluation = {
            summary: 'You appear to value calm, seek better focus, and want support with anxiety.',
            primaryNeed: needs[0] || 'General Well-being',
            suggestedTracks: [
                'Daily 1-min Breathe + Evening Reflection',
                'Focus-25 Pomodoro plan',
                'Cognitive reframing for overthinking',
            ],
            confidence: 0.78,
            tags: ['onboarding', 'cold-start', 'gemini-ready'],
            echo: payload,
        };

        setEvaluating(false);
        nav.navigate('Homescreen', { profile: payload.profile, answers, evaluation });
    }

    return (
        <View style={[styles.root]}>
            <View style={styles.header}>
                <View style={styles.brandRow}>
                    <View style={styles.logoDot} />
                    <Text style={styles.brand}>Calm Pulse</Text>
                </View>

                <Text style={styles.title}>
                    {step === 0 ? 'Let’s personalize your space' : `Question ${step} of ${questions.length}`}
                </Text>
                <Text style={styles.subtitle}>
                    {step === 0
                        ? 'A few quick details so we can support you better.'
                        : 'Short answers are fine. There are no right or wrong responses.'}
                </Text>

                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, {
                        width: progAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                        })
                    }]} />
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    bounces
                >
                    <View style={styles.card}>
                        {step === 0 ? (
                            <ProfileBlock
                                c={c}
                                styles={styles}
                                age={age}
                                setAge={setAge}
                                gender={gender}
                                setGender={setGender}
                                needs={needs}
                                onToggleNeed={onToggleNeed}
                            />
                        ) : (
                            <QuestionBlock
                                c={c}
                                styles={styles}
                                q={questions[step - 1]}
                                value={answers[questions[step - 1]?.id] || ''}
                                onChange={(val) =>
                                    setAnswers((prev) => ({ ...prev, [questions[step - 1].id]: val }))
                                }
                            />
                        )}
                    </View>

                    <View style={styles.footer}>
                        <PillButton
                            label="Back"
                            variant="ghost"
                            disabled={step === 0}
                            onPress={onBack}
                            c={c}
                        />
                        {step !== 10 ? (
                            <PillButton
                                label="Next"
                                onPress={onNext}
                                disabled={step === 0 && !canNextFromProfile}
                                c={c}
                            />
                        ) : (
                            <PillButton
                                label="Finish"
                                onPress={handleEvaluate}
                                c={c}
                            />
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            {evaluating && (
                <View style={styles.overlay}>
                    <View style={styles.overlayCard}>
                        {LottieView ? (
                            <LottieView
                                source={require('../assets/lottie/understanding.json')}
                                autoPlay
                                loop
                                style={{ width: 160, height: 160 }}
                            />
                        ) : (
                            <ActivityIndicator size="large" color={c.brand} />
                        )}

                        <Text style={styles.overlayText}>{phase}</Text>
                        <Text style={styles.overlayHint}>This may take a few moments…</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

function ProfileBlock({ c, styles, age, setAge, gender, setGender, needs, onToggleNeed }) {
    return (
        <View>
            <Text style={styles.sectionTitle}>Basic details</Text>

            <Text style={styles.label}>Age</Text>
            <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="e.g., 21"
                placeholderTextColor={c.muted}
                keyboardType="number-pad"
                style={styles.input}
                maxLength={3}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Gender</Text>
            <View style={styles.row}>
                {[
                    { key: 'male', label: 'Male' },
                    { key: 'female', label: 'Female' },
                    { key: 'other', label: 'Other' },
                ].map((g) => (
                    <Chip
                        key={g.key}
                        label={g.label}
                        active={gender === g.key}
                        onPress={() => setGender(g.key)}
                        c={c}
                    />
                ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>What help do you need?</Text>
            <View style={styles.wrapRow}>
                {HELP_TOPICS.map((h) => (
                    <Chip
                        key={h}
                        label={h}
                        active={needs.includes(h)}
                        onPress={() => onToggleNeed(h)}
                        c={c}
                    />
                ))}
            </View>

            <Text style={styles.hint}>
                Your answers shape tailored tools, routines, and suggestions. You can update these later.
            </Text>
        </View>
    );
}

function QuestionBlock({ c, styles, q, value, onChange }) {
    if (!q) return null;
    return (
        <View>
            <View style={{ marginBottom: 10 }}>
                <Text style={styles.category}>{q.category}</Text>
                <Text style={styles.question}>{q.text}</Text>
            </View>
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Write your response…"
                placeholderTextColor={c.muted}
                multiline
                textAlignVertical="top"
                style={[styles.input, { minHeight: 130, paddingTop: 12 }]}
            />
            <Text style={styles.hint}>A sentence or two is perfect.</Text>
        </View>
    );
}

function Chip({ label, active, onPress, c }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                chipStyles.base,
                { borderColor: active ? c.brandSoftBorder : c.border, backgroundColor: active ? c.chipActiveBg : c.chipBg },
                pressed && chipStyles.pressed,
            ]}
        >
            <Text style={[chipStyles.text, { color: active ? c.chipTextActive : c.chipText }]}>
                {label}
            </Text>
        </Pressable>
    );
}

function PillButton({ label, onPress, disabled, variant = 'primary', c }) {
    const bg =
        variant === 'ghost' ? 'transparent' : disabled ? c.btnDisabled : c.btn;
    const fg = variant === 'ghost' ? c.text : c.onBtn;

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                {
                    paddingHorizontal: 18,
                    height: 46,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: bg,
                    borderWidth: variant === 'ghost' ? StyleSheet.hairlineWidth : 0,
                    borderColor: variant === 'ghost' ? c.border : 'transparent',
                    opacity: pressed ? 0.9 : 1,
                    shadowColor: c.shadowColor,
                    shadowOpacity: 0.16,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 1,
                    minWidth: 110,
                },
            ]}
        >
            <Text style={{ color: fg, fontWeight: '700' }}>{label}</Text>
        </Pressable>
    );
}

function getColors(isDark) {
    return {
        bg: isDark ? '#0b1220' : '#f3f6fb',
        headerGlass: isDark ? 'rgba(16,22,35,0.6)' : 'rgba(255,255,255,0.7)',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(2,6,23,0.08)',
        text: isDark ? '#e5e7eb' : '#0f172a',
        sub: isDark ? '#cbd5e1' : '#334155',
        muted: isDark ? '#94a3b8' : '#6b7280',
        inputBg: isDark ? 'rgba(15,23,42,0.75)' : '#ffffff',
        inputText: isDark ? '#e5e7eb' : '#0f172a',
        card: isDark ? 'rgba(17,25,40,0.75)' : 'rgba(255,255,255,0.92)',
        brand: isDark ? '#8ab4ff' : '#4f46e5',
        brandSoftBorder: isDark ? 'rgba(99,102,241,0.5)' : 'rgba(79,70,229,0.35)',
        chipBg: isDark ? 'rgba(148,163,184,0.14)' : 'rgba(2,6,23,0.05)',
        chipActiveBg: isDark ? 'rgba(79,70,229,0.22)' : 'rgba(99,102,241,0.12)',
        chipText: isDark ? '#d1d5db' : '#334155',
        chipTextActive: isDark ? '#e0e7ff' : '#3730a3',
        btn: isDark ? '#4f46e5' : '#4f46e5',
        onBtn: '#ffffff',
        btnDisabled: isDark ? '#334155' : '#cbd5e1',
        shadowColor: isDark ? '#000' : '#0f172a',
        overlayGlass: isDark ? 'rgba(10,15,25,0.6)' : 'rgba(255,255,255,0.65)',
    };
}

function makeStyles(c) {
    return StyleSheet.create({
        root: { flex: 1, backgroundColor: c.bg },
        header: {
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 12,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: c.border,
            backgroundColor: c.headerGlass,
            shadowColor: c.shadowColor,
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 1,
        },
        brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
        logoDot: {
            width: 14, height: 14, borderRadius: 7, backgroundColor: c.brand,
            shadowColor: c.shadowColor, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
        },
        brand: { color: c.sub, fontWeight: '700', letterSpacing: 0.5 },
        title: { color: c.text, fontWeight: '800', fontSize: 20 },
        subtitle: { color: c.muted, marginTop: 4, fontSize: 12 },
        progressTrack: {
            height: 10, borderRadius: 999, backgroundColor: c.chipBg, overflow: 'hidden',
            marginTop: 12,
        },
        progressFill: { height: 10, backgroundColor: c.brand, borderRadius: 999 },

        scroll: { padding: 20, paddingBottom: 28 },
        card: {
            backgroundColor: c.card,
            borderRadius: 24,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: c.border,
            padding: 16,
            shadowColor: c.shadowColor,
            shadowOpacity: 0.12,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 2,
        },
        sectionTitle: {
            color: c.text, fontWeight: '700', marginBottom: 10, fontSize: 16,
        },
        label: { color: c.sub, fontSize: 13, marginBottom: 6 },
        input: {
            backgroundColor: c.inputBg,
            color: c.inputText,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: c.border,
            paddingHorizontal: 12,
            paddingVertical: Platform.OS === 'ios' ? 12 : 10,
            borderRadius: 14,
        },
        hint: { color: c.muted, fontSize: 12, marginTop: 8 },

        row: { flexDirection: 'row', gap: 8 },
        wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

        category: { color: c.muted, fontSize: 12, marginBottom: 2 },
        question: { color: c.text, fontSize: 17, fontWeight: '700' },

        footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 14 },

        overlay: {
            ...StyleSheet.absoluteFillObject,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.overlayGlass,
            paddingHorizontal: 24,
        },
        overlayCard: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.card,
            borderRadius: 24,
            padding: 20,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: c.border,
            width: 280,
        },
        overlayText: { color: c.text, fontWeight: '800', marginTop: 12 },
        overlayHint: { color: c.muted, marginTop: 4, fontSize: 12, textAlign: 'center' },
    });
}

const chipStyles = StyleSheet.create({
    base: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
    },
    pressed: { opacity: 0.9 },
    text: { fontSize: 13, fontWeight: '600' },
});

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
