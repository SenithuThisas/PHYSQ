import React, { useMemo } from 'react';
import { Pressable, Text, View, PressableProps } from 'react-native';

type Props = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary';
  className?: string;
};

export default function Button({ title, variant = 'primary', className, ...rest }: Props) {
  const base = 'px-4 py-3 rounded-xl border items-center';
  const primary = 'border-violet-500';
  const secondary = 'border-surface-200';
  const textColor = variant === 'primary' ? 'text-violet-400' : 'text-slate-200';

  return (
    <Pressable
      className={`${base} ${variant === 'primary' ? primary : secondary} ${className ?? ''}`}
      style={{ shadowColor: '#A259FF', shadowOpacity: variant === 'primary' ? 0.6 : 0.2, shadowRadius: variant === 'primary' ? 8 : 2, shadowOffset: { width: 0, height: 0 } }}
      android_ripple={{ color: variant === 'primary' ? 'rgba(162,89,255,0.2)' : 'rgba(255,255,255,0.1)' }}
      {...rest}
    >
      <Text className={`font-semibold ${textColor}`}>{title}</Text>
    </Pressable>
  );
}
