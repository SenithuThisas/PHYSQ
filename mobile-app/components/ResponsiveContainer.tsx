import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useBreakpoints } from '../hooks/useBreakpoints';
import { Colors } from '../constants/Colors';

interface ResponsiveContainerProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    maxWidth?: number;
    centerContent?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
    children,
    style,
    maxWidth = 1280,
    centerContent = true
}) => {
    const { isDesktop, width } = useBreakpoints();

    return (
        <View style={[styles.container, centerContent && styles.centered]}>
            <View
                style={[
                    styles.content,
                    style,
                    {
                        maxWidth: maxWidth,
                        width: '100%',
                        // Add horizontal padding on smaller screens if not strictly controlled elsewhere
                        paddingHorizontal: width < maxWidth ? 0 : 0
                    }
                ]}
            >
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    centered: {
        alignItems: 'center',
    },
    content: {
        flex: 1,
    }
});
