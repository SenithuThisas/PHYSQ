module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@react-navigation|expo(nent)?|@expo|expo-.*|@expo/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ]
};

