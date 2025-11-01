import React from 'react';
import { View, Text } from 'react-native';
import Screen from '@/components/layout/Screen';

export default function WorkoutDetailScreen() {
  return (
    <Screen>
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Workout Detail</Text>
        <Text className="text-slate-300 mt-2">Completed sets and PRs will appear here.</Text>
      </View>
    </Screen>
  );
}

