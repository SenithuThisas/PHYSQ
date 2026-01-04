import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
    TABLET: 768,
    DESKTOP: 1024,
    WIDE: 1280,
};

export const useBreakpoints = () => {
    const { width } = useWindowDimensions();

    const isMobile = width < BREAKPOINTS.TABLET;
    const isTablet = width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP;
    const isDesktop = width >= BREAKPOINTS.DESKTOP;

    // Convenient helpers
    const isWeb = width >= BREAKPOINTS.TABLET; // Treats tablet and up as "web-like" layout usually

    return {
        width,
        isMobile,
        isTablet,
        isDesktop,
        isWeb,
        breakpoints: BREAKPOINTS,
    };
};
