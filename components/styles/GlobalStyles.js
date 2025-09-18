// styles/GlobalStyles.js

import { StyleSheet, Platform, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export const L = {
    appBg: '#f8fafc',
    text: '#0f172a',
    muted: '#64748b',
    border: 'rgba(2,6,23,0.12)',
    card: '#ffffff',
    ghost: '#f1f5f9',
    glass: 'rgba(255,255,255,0.7)',
    primary: '#6366f1',
    primary_muted: 'rgba(99, 102, 241, 0.1)',
};
export const D = {
    appBg: '#0b1220',
    text: '#e5edff',
    muted: '#93a4c8',
    border: 'rgba(255,255,255,0.12)',
    card: '#1e293b',
    ghost: '#334155',
    glass: 'rgba(2,6,23,0.6)',
    primary: '#7dd3fc',
    primary_muted: 'rgba(125, 211, 252, 0.1)',
};

export const S = StyleSheet.create({
    // Layout
    flex: { flex: 1, height: "100%" },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

    // Header
    headerWrap: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjusted for status bar
    },
    logoBlob: { width: 32, height: 32, borderRadius: 16 },
    headerTitle: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
    headerIcon: { padding: 4 },

    // Chat Bubble
    bubbleContainerMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    bubbleContainerBot: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    botAvatar: { width: 28, height: 28, borderRadius: 14, marginBottom: 4 },
    bubble: {
        maxWidth: '85%',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    bubbleTextMe: { color: '#fff' },
    body: { fontSize: 15, lineHeight: 22 },

    // Input Area
    inputAreaContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    textInput: {
        flex: 1,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
        minHeight: 44,
        maxHeight: 120, // Allows for multiline input up to a certain height
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Quick Replies
    quickReplyScrollView: { marginTop: 8 },
    quickReplyContainer: { gap: 8, paddingHorizontal: 16 },
    quickReplyButton: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        height: 40,
        justifyContent: "center"
    },
    quickReplyText: { fontSize: 13 },

    // Typing Hint
    typingHintContainer: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
    typingHintText: { fontSize: 13 },
    dot: { width: 6, height: 6, borderRadius: 3 },
});