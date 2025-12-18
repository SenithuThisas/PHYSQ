import { Tabs } from 'expo-router';
import { Colors as DefaultColors } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { View, useWindowDimensions, Platform } from 'react-native';
import SideNav from '../../components/SideNav';

export default function TabLayout() {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width > 768;
    const { colors } = useTheme();

    return (
        <View style={{ flex: 1, flexDirection: isWeb ? 'row' : 'column' }}>
            {isWeb && <SideNav />}
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: isWeb ? { display: 'none' } : {
                        backgroundColor: colors.surface,
                        borderTopColor: colors.border,
                        height: Platform.OS === 'ios' ? 90 : 70,
                        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
                        paddingTop: 8,
                    },
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.textSecondary,
                    tabBarShowLabel: true,
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={20} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="workout"
                    options={{
                        title: 'Workout',
                        tabBarIcon: ({ color }) => <FontAwesome5 name="dumbbell" size={20} color={color} />,
                        // tabBarLabel removed to allow default label to show
                    }}
                />
                <Tabs.Screen
                    name="progress"
                    options={{
                        title: 'Progress',
                        tabBarIcon: ({ color }) => <FontAwesome5 name="chart-line" size={20} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={20} color={color} />,
                    }}
                />
            </Tabs>
        </View>
    );
}
