import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import StartWorkoutScreen from '@/features/workouts/screens/StartWorkoutScreen';
import WorkoutDetailScreen from '@/features/workouts/screens/WorkoutDetailScreen';
import ExercisePickerScreen from '@/features/workouts/screens/ExercisePickerScreen';

export type AppStackParamList = {
  MainTabs: undefined;
  StartWorkout: undefined;
  WorkoutDetail: { id: string } | undefined;
  ExercisePicker: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="StartWorkout" component={StartWorkoutScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} />
    </Stack.Navigator>
  );
}

