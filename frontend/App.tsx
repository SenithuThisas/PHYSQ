import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#A259FF', fontSize: 24, fontWeight: '700' }}>PHYSQ</Text>
        <Text style={{ color: '#7B2FFF', marginTop: 8 }}>Hybrid Fitness Tracker</Text>
      </View>
    </SafeAreaView>
  );
}

