import React from 'react';
import { View, Text } from 'react-native';

type Props = { title: string; right?: React.ReactNode };

export default function Header({ title, right }: Props) {
  return (
    <View className="px-4 py-3 flex-row items-center justify-between bg-surface">
      <Text className="text-white text-xl font-semibold">{title}</Text>
      {right}
    </View>
  );
}
