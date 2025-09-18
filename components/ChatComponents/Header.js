// components/Header.js

import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { S } from '../styles/GlobalStyles';

export default function Header({ palette }) {
  return (
    <View style={[S.headerWrap, { borderBottomColor: palette.border, backgroundColor: palette.glass }]}>
      <View style={S.rowBetween}>
        <View style={S.row}>
          <Image style={S.logoBlob} source={require('../../assets/logo.png')} />
          <Text style={[S.headerTitle, { color: palette.text }]}>Calm Pulse</Text>
        </View>
        <View style={S.row}>
          <Pressable style={S.headerIcon}>
            <MaterialIcons name="mic" size={24} color={palette.muted} />
          </Pressable>
          <Pressable style={S.headerIcon}>
            <MaterialIcons name="close" size={24} color={palette.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}