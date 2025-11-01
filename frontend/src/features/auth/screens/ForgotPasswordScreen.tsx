import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { supabase } from '@/lib/supabase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSend = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'physq://reset-password'
    });
    if (error) setError(error.message); else setSent(true);
  };

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-3xl font-extrabold text-center">Reset Password</Text>
      <Text className="text-slate-300 text-center mt-1">We'll email you a reset link</Text>
      <View className="mt-10 gap-4">
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        {error ? <Text className="text-red-400">{error}</Text> : null}
        {sent ? <Text className="text-green-400">Email sent. Check your inbox.</Text> : null}
        <Button title="Send reset link" onPress={onSend} />
      </View>
    </View>
  );
}

