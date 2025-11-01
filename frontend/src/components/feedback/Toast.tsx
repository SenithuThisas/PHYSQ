// Simple inline toast placeholder – replace with proper system later
import React from 'react';
import { View, Text } from 'react-native';

type Props = { message: string };
export default function Toast({ message }: Props) {
  return (
    <View className="absolute bottom-8 left-4 right-4 bg-white/10 border border-white/15 rounded-xl p-3">
      <Text className="text-white text-center">{message}</Text>
    </View>
  );
}
