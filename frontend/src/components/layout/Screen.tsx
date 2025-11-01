import React, { PropsWithChildren } from 'react';
import { SafeAreaView, View } from 'react-native';

export default function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
