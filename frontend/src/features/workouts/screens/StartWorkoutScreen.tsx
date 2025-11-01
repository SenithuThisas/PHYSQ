import React from 'react';
import { View, Text } from 'react-native';
import Screen from '@/components/layout/Screen';
import Button from '@/components/ui/Button';
import { useNavigation } from '@react-navigation/native';

export default function StartWorkoutScreen() {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">New Workout</Text>
      </View>
      <View className="px-4 gap-3">
        <Button title="Add Exercise" onPress={() => nav.navigate('ExercisePicker')} />
        <Button title="Finish" variant="secondary" onPress={() => nav.navigate('WorkoutDetail')} />
      </View>
    </Screen>
  );
}

