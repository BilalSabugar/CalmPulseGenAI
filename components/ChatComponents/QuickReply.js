// components/QuickReply.js

import React from 'react';
import { ScrollView, Text, Pressable } from 'react-native';
import { S } from '../styles/GlobalStyles';

export default function QuickReply({ palette, onSend }) {
    const replies = ['✨ 1‑min Breathe', '📋 Plan my day', '❤️ Log my mood'];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={S.quickReplyScrollView}
            contentContainerStyle={S.quickReplyContainer}
        >
            {replies.map(reply => (
                <Pressable
                    key={reply}
                    onPress={() => onSend(reply)}
                    style={[S.quickReplyButton, { borderColor: palette.border, backgroundColor: palette.ghost, }]}
                >
                    <Text style={[S.quickReplyText, { color: palette.text }]}>{reply}</Text>
                </Pressable>
            ))}
        </ScrollView>
    );
}