import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, LayoutAnimation, Pressable, Animated, Modal } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const NavItem = ({ item, isActive, isCollapsed, onPress }: { item: any, isActive: boolean, isCollapsed: boolean, onPress: () => void }) => {
    const scale = useRef(new Animated.Value(1)).current;

    // Web Hover Handling
    const [isHovered, setIsHovered] = useState(false);

    const onHoverIn = () => {
        setIsHovered(true);
        Animated.spring(scale, { toValue: 1.05, useNativeDriver: true }).start();
    };

    const onHoverOut = () => {
        setIsHovered(false);
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    const activeOrHovered = isActive || isHovered;

    return (
        <AnimatedPressable
            onPress={onPress}
            onHoverIn={onHoverIn}
            onHoverOut={onHoverOut}
            style={[
                styles.navItem,
                // isActive && styles.navItemActive, // Removed background
                isCollapsed && styles.navItemCollapsed,
                { transform: [{ scale }] }
            ]}
        >
            <View style={[styles.iconContainer, /* isActive && styles.iconContainerActive */]}>
                <FontAwesome5
                    name={item.icon}
                    size={20}
                    color={activeOrHovered ? Colors.primary : Colors.textSecondary}
                />
            </View>
            {!isCollapsed && (
                <Text style={[styles.navText, activeOrHovered && styles.navTextActive]}>
                    {item.name}
                </Text>
            )}
        </AnimatedPressable>
    );
};

export default function SideNav() {
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { signOut } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

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

    const handleLogout = () => {
        if (showLogoutModal) return; // Prevent double execution if triggered somehow
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        signOut();
    };

    return (
        <View style={[styles.container, collapsed ? styles.collapsedContainer : styles.expandedContainer]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={toggleCollapse} style={styles.toggleBtn}>
                    <FontAwesome5 name={collapsed ? "bars" : "chevron-left"} size={20} color={Colors.text} />
                </TouchableOpacity>
                {!collapsed && <Text style={styles.logoText}>PHYSQ</Text>}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.navItems}
                showsVerticalScrollIndicator={false}
            >
                {navItems.map((item) => {
                    // Fix logic to properly handle root "/" path for Home tab
                    const isActive =
                        pathname === item.path ||
                        (item.path === '/(tabs)' && pathname === '/') ||
                        (item.path !== '/(tabs)' && pathname.startsWith(item.path));

                    return (
                        <NavItem
                            key={item.name}
                            item={item}
                            isActive={isActive}
                            isCollapsed={collapsed}
                            onPress={() => router.push(item.path as any)}
                        />
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <FontAwesome5 name="sign-out-alt" size={20} color={Colors.textSecondary} />
                    {!collapsed && <Text style={styles.logoutText}>Logout</Text>}
                </TouchableOpacity>
            </View>

            {/* Custom Logout Modal */}
            <Modal
                transparent={true}
                visible={showLogoutModal}
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Log Out</Text>
                        <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowLogoutModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.logoutConfirmButton]}
                                onPress={confirmLogout}
                            >
                                <Text style={styles.logoutConfirmButtonText}>Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        // Removed justifyContent to let ScrollView expand naturally
    },
    scrollView: {
        flex: 1,
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
        // backgroundColor: Colors.primary, // Removed
    },
    iconContainer: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    iconContainerActive: {
        // backgroundColor: Colors.background, // Removed
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 24,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 16,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cancelButtonText: {
        color: Colors.text,
        fontWeight: '600',
    },
    logoutConfirmButton: {
        backgroundColor: '#FF3B30', // Destructive red
    },
    logoutConfirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
