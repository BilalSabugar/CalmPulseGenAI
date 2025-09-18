// components/ChatInput.js

import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { S } from '../styles/GlobalStyles';

export default function ChatInput({ palette, text, setText, onSend }) {
  const canSend = text.trim().length > 0;

  return (
    <View style={[S.inputAreaContainer, { borderTopColor: palette.border }]}>
      <View style={S.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          placeholderTextColor={palette.muted}
          style={[S.textInput, { borderColor: palette.border, backgroundColor: palette.ghost, color: palette.text }]}
          multiline
        />
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={[S.sendButton, { backgroundColor: canSend ? palette.primary : palette.ghost }]}
        >
          <MaterialIcons name="send" size={20} color={canSend ? '#fff' : palette.muted} />
        </Pressable>
      </View>
    </View>
  );
}