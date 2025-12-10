import React from 'react';
import { ScrollView, View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import Screen from '@/components/layout/Screen';
import Button from '@/components/ui/Button';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

const highlights = [
  { label: 'Athletes', value: '12k+' },
  { label: 'Avg. PR gain', value: '18%' },
  { label: 'Weekly habits', value: '64k' }
];

const features = [
  {
    title: 'Adaptive coaching',
    body: 'AI assisted programs that respond to your recovery, load and goals in real time.'
  },
  {
    title: 'Precision tracking',
    body: 'Unified view of workouts, body metrics and habits so every decision is data-backed.'
  },
  {
    title: 'Community energy',
    body: 'Micro accountability squads and streaks keep you moving when motivation dips.'
  }
];

const steps = ['Create your profile', 'Sync wearables & habits', 'Crush the next block'];

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  return (
    <Screen>
      <ScrollView
        className="flex-1 bg-black"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-10 gap-10">
          <View className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-surface-200 px-6 py-8">
            <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/30 blur-3xl" />
            <View className="absolute -left-16 top-10 h-32 w-32 rounded-full bg-violet-600/20 blur-3xl" />
            <Text className="text-xs uppercase tracking-[0.3em] text-slate-400">PHYSQ</Text>
            <Text className="mt-4 text-4xl font-semibold text-white leading-tight">
              Train smarter. <Text className="text-violet-500">Feel unstoppable.</Text>
            </Text>
            <Text className="mt-4 text-base text-slate-300">
              Physq blends strength programming, recovery signals and habit tracking into one focused flow.
            </Text>
            <View className="mt-6 flex-row gap-3">
              <Button title="Start free trial" onPress={() => navigation.navigate('SignUp')} className="flex-1" />
              <Button
                title="Sign in"
                variant="secondary"
                onPress={() => navigation.navigate('SignIn')}
                className="flex-1"
              />
            </View>
            <View className="mt-8 flex-row justify-between">
              {highlights.map((item) => (
                <View key={item.label}>
                  <Text className="text-2xl font-semibold text-white">{item.value}</Text>
                  <Text className="text-xs uppercase tracking-wide text-slate-400">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-4">
            <Text className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Why Physq
            </Text>
            <View className="gap-4">
              {features.map((feature) => (
                <View
                  key={feature.title}
                  className="rounded-2xl border border-white/5 bg-surface-200/60 p-5"
                >
                  <Text className="text-lg font-semibold text-white">{feature.title}</Text>
                  <Text className="mt-2 text-slate-300">{feature.body}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-3xl border border-violet-500/20 bg-surface-200/80 p-6">
            <Text className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              How it works
            </Text>
            <View className="mt-5 gap-4">
              {steps.map((step, index) => (
                <View key={step} className="flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl border border-violet-500/30 bg-black/40">
                    <Text className="text-lg font-semibold text-violet-500">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-base text-white">{step}</Text>
                </View>
              ))}
            </View>
            <View className="mt-6 rounded-2xl border border-white/5 bg-black/40 p-4">
              <Text className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Daily readiness
              </Text>
              <View className="mt-4 flex-row items-end justify-between">
                <View>
                  <Text className="text-4xl font-semibold text-white">92%</Text>
                  <Text className="text-sm text-slate-400">Readiness score</Text>
                </View>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80' }}
                  className="h-24 w-24 rounded-2xl"
                />
              </View>
            </View>
          </View>

          <View className="rounded-3xl border border-white/5 bg-surface-200/80 p-6">
            <Text className="text-3xl font-semibold text-white">Level up with us</Text>
            <Text className="mt-3 text-slate-300">
              Early members get concierge onboarding, weekly accountability calls and access
              to our private launch community.
            </Text>
            <Button title="Reserve your spot" onPress={() => navigation.navigate('SignUp')} className="mt-6" />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
