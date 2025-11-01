import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';

type Props = TextInputProps & { label?: string };

export default function Input({ label, ...rest }: Props) {
  return (
    <View>
      {label ? <Text className="text-slate-300 mb-2">{label}</Text> : null}
      <TextInput
        placeholderTextColor="#777"
        className="bg-surface rounded-xl px-4 py-3 text-white border border-surface-200"
        {...rest}
      />
    </View>
  );
}
