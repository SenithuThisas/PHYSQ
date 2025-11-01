import React from 'react';
import { View, Text } from 'react-native';
import Screen from '@/components/layout/Screen';
import Button from '@/components/ui/Button';
import { useNavigation } from '@react-navigation/native';

export default function WorkoutsScreen() {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Workouts</Text>
      </View>
      <View className="px-4">
        <Button title="Start Workout" onPress={() => nav.navigate('StartWorkout')} />
      </View>
    </Screen>
  );
}

