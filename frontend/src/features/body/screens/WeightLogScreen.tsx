import React from 'react';
import { View, Text } from 'react-native';
import Screen from '@/components/layout/Screen';
import Card from '@/components/ui/Card';

export default function WeightLogScreen() {
  return (
    <Screen>
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Body</Text>
      </View>
      <View className="px-4">
        <Card>
          <Text className="text-white font-semibold">Weight Log</Text>
          <Text className="text-slate-300 mt-2">Add today's weight and track trends.</Text>
        </Card>
      </View>
    </Screen>
  );
}

