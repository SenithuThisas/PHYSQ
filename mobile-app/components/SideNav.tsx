import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, LayoutAnimation } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useState } from 'react';

export default function SideNav() {
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { name: 'Home', icon: 'home', path: '/(tabs)' },
        { name: 'Workout', icon: 'dumbbell', path: '/(tabs)/workout' },
        { name: 'Progress', icon: 'chart-line', path: '/(tabs)/progress' },
        { name: 'Profile', icon: 'user', path: '/(tabs)/profile' },
    ];

    const toggleCollapse = () => {
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Optional animation
        setCollapsed(!collapsed);
    };

    return (
        <View style={[styles.container, collapsed ? styles.collapsedContainer : styles.expandedContainer]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={toggleCollapse} style={styles.toggleBtn}>
                    <FontAwesome5 name={collapsed ? "bars" : "chevron-left"} size={20} color={Colors.text} />
                </TouchableOpacity>
                {!collapsed && <Text style={styles.logoText}>PHYSQ</Text>}
            </View>

            <ScrollView contentContainerStyle={styles.navItems} showsVerticalScrollIndicator={false}>
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/(tabs)' && pathname.startsWith(item.path));

                    return (
                        <TouchableOpacity
                            key={item.name}
                            style={[
                                styles.navItem,
                                isActive && styles.navItemActive,
                                collapsed && styles.navItemCollapsed
                            ]}
                            onPress={() => router.push(item.path as any)}
                        >
                            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                                <FontAwesome5
                                    name={item.icon}
                                    size={20}
                                    color={isActive ? Colors.background : Colors.textSecondary}
                                />
                            </View>
                            {!collapsed && (
                                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                                    {item.name}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.logoutBtn}>
                    <FontAwesome5 name="sign-out-alt" size={20} color={Colors.textSecondary} />
                    {!collapsed && <Text style={styles.logoutText}>Logout</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderRightWidth: 1,
        borderRightColor: Colors.border,
        height: '100%',
        paddingVertical: 24,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
        // Web sticky behavior
        ...(Platform.OS === 'web' ? {
            position: 'sticky',
            top: 0,
            zIndex: 100,
            overflow: 'hidden' as any
        } : {})
    },
    expandedContainer: {
        width: 240,
    },
    collapsedContainer: {
        width: 80,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 48,
        paddingHorizontal: 8,
        height: 40,
    },
    toggleBtn: {
        padding: 8,
    },
    logoText: {
        color: Colors.primary,
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 16,
        letterSpacing: 2,
    },
    navItems: {
        gap: 8,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 4,
    },
    navItemCollapsed: {
        justifyContent: 'center',
        paddingHorizontal: 0,
        width: 48,
    },
    navItemActive: {
        backgroundColor: Colors.surfaceLight,
    },
    iconContainer: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    iconContainerActive: {
        backgroundColor: Colors.primary,
    },
    navText: {
        color: Colors.textSecondary,
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '600',
    },
    navTextActive: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 'auto',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 24,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        opacity: 0.8,
    },
    logoutText: {
        color: Colors.textSecondary,
        marginLeft: 12,
        fontSize: 14,
    },
});
