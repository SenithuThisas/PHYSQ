import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '@/features/dashboard/screens/DashboardScreen';
import WorkoutsScreen from '@/features/workouts/screens/WorkoutsScreen';
import WeightLogScreen from '@/features/body/screens/WeightLogScreen';
import HabitsScreen from '@/features/habits/screens/HabitsScreen';
import AnalyticsScreen from '@/features/analytics/screens/AnalyticsScreen';
import { Ionicons } from '@expo/vector-icons';

export type TabsParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Body: undefined;
  Habits: undefined;
  Analytics: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0A0A0A', borderTopColor: '#161616' },
        tabBarActiveTintColor: '#A259FF',
        tabBarInactiveTintColor: '#666',
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'home',
            Workouts: 'barbell',
            Body: 'fitness',
            Habits: 'water',
            Analytics: 'stats-chart'
          };
          const name = map[route.name] ?? 'ellipse';
          return <Ionicons name={name as any} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Body" component={WeightLogScreen} options={{ title: 'Body' }} />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}

