import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthStore } from '../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, error, setError } = useAuthStore();

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-3xl font-extrabold text-center">PHYSQ</Text>
      <Text className="text-violet-500 text-center mt-1">Hybrid Fitness Tracker</Text>

      <View className="mt-10 gap-4">
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? (
          <Text className="text-red-400">{error}</Text>
        ) : null}
        <Button title="Sign In" onPress={() => signIn(email.trim(), password)} />
        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
          <Text className="text-slate-300 text-center">Forgot password?</Text>
        </Pressable>
      </View>

      <View className="mt-8 flex-row justify-center">
        <Text className="text-slate-300 mr-2">No account?</Text>
        <Pressable onPress={() => { setError(null); navigation.navigate('SignUp'); }}>
          <Text className="text-violet-400">Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
}

