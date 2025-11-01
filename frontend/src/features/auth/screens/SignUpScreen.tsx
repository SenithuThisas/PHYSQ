import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthStore } from '../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, error, setError } = useAuthStore();

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-3xl font-extrabold text-center">Create Account</Text>
      <Text className="text-violet-500 text-center mt-1">Start tracking your progress</Text>

      <View className="mt-10 gap-4">
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? (
          <Text className="text-red-400">{error}</Text>
        ) : null}
        <Button title="Create Account" onPress={() => signUp(email.trim(), password)} />
        <Pressable onPress={() => { setError(null); navigation.navigate('SignIn'); }}>
          <Text className="text-slate-300 text-center">Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

