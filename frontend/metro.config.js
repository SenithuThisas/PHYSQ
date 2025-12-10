const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'expo-font': path.resolve(__dirname, 'node_modules/expo/node_modules/expo-font'),
  'zustand': path.resolve(__dirname, 'node_modules/zustand/index.js')
};

module.exports = config;
