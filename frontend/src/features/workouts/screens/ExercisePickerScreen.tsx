import React from 'react';
import { View, Text } from 'react-native';
import Screen from '@/components/layout/Screen';

export default function ExercisePickerScreen() {
  return (
    <Screen>
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Pick Exercises</Text>
        <Text className="text-slate-300 mt-2">Search and add exercises to your workout.</Text>
      </View>
    </Screen>
  );
}

