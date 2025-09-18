// components/TypingHint.js

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { S } from '../styles/GlobalStyles';

export default function TypingHint({ palette }) {
  const fade = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [fade]);

  return (
    <View style={[S.row, S.typingHintContainer]}>
      <Animated.Text style={[S.typingHintText, { color: palette.muted, opacity: fade }]}>
        Calm Pulse is typing
      </Animated.Text>
    </View>
  );
}