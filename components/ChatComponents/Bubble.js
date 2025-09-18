// components/Bubble.js

import React from 'react';
import { View, Text, Image } from 'react-native';
import { S } from '../styles/GlobalStyles';

export default function Bubble({ who, text, palette }) {
  const isMe = who === 'me';

  if (isMe) {
    return (
      <View style={S.bubbleContainerMe}>
        <View style={[S.bubble, { backgroundColor: palette.primary }]}>
          <Text style={[S.body, S.bubbleTextMe]}>{text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={S.bubbleContainerBot}>
      <View style={S.bubbleRow}>
        <Image style={S.botAvatar} source={require('../../assets/logo.png')} />
        <View style={[S.bubble, { backgroundColor: palette.ghost, borderColor: palette.border, borderWidth: 1 }]}>
          <Text style={[S.body, { color: palette.text }]}>{text}</Text>
        </View>
      </View>
    </View>
  );
}