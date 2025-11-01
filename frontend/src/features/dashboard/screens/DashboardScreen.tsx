import React from 'react';
import { View, Text } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/layout/Screen';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function DashboardScreen() {
  const nav = useNavigation<any>();
  const { signOut } = useAuthStore();

  return (
    <Screen>
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Dashboard</Text>
      </View>
      <View className="px-4 gap-4">
        <View className="flex-row gap-3">
          <Button title="Start Workout" onPress={() => nav.navigate('StartWorkout')} className="flex-1" />
          <Button title="Log Weight" variant="secondary" onPress={() => nav.navigate('Body')} className="flex-1" />
        </View>
        <Button title="Add Photo" variant="secondary" onPress={() => {}} />

        <Card variant="glass" className="mt-3">
          <Text className="text-white font-semibold">Snapshot</Text>
          <Text className="text-slate-300 mt-2">Volume: 0 • Streak: 0 • Latest PR: —</Text>
        </Card>
        <Button title="Sign Out" onPress={signOut} />
      </View>
    </Screen>
  );
}

