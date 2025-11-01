import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Spinner() {
  return (
    <View className="items-center justify-center">
      <ActivityIndicator color="#A259FF" />
    </View>
  );
}
