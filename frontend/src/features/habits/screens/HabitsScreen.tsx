import React from 'react';
import { View, Text } from 'react-native';
import Screen from '@/components/layout/Screen';

export default function HabitsScreen() {
  return (
    <Screen>
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Habits</Text>
        <Text className="text-slate-300 mt-2">Daily check-ins: Water, Protein, Sleep, Steps, Supplements</Text>
      </View>
    </Screen>
  );
}

