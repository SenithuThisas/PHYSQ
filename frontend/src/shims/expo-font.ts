// Shim expo-font to Expo SDK 51 compatible implementation on web.
// Expo 51 ships expo-font@12 inside expo's own node_modules. Newer 14.x builds
// expect registerWebModule which isn't available yet, so we re-export the
// bundled copy to avoid runtime crashes.
export * from 'expo/node_modules/expo-font';
export { default } from 'expo/node_modules/expo-font';
