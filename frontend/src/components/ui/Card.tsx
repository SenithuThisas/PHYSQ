import React, { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

type Props = PropsWithChildren<{
  variant?: 'flat' | 'glass';
  className?: string;
}> & ViewProps;

export default function Card({ variant = 'flat', className, children, ...rest }: Props) {
  const base = 'rounded-2xl p-4';
  const flat = 'bg-surface';
  const glass = 'bg-white/5 border border-white/10';
  return (
    <View className={`${base} ${variant === 'flat' ? flat : glass} ${className ?? ''}`} {...rest}>
      {children}
    </View>
  );
}
