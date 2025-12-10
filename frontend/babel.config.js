const nativewind = require("nativewind/babel");

module.exports = function (api) {
  api.cache(true);
  const { plugins: nativewindPlugins = [] } = nativewind();

  return {
    presets: [
      [
        "babel-preset-expo",
        {
          unstable_transformImportMeta: true
        }
      ]
    ],
    plugins: [
      ...nativewindPlugins.filter((plugin) => plugin !== "react-native-worklets/plugin"),
      [
        "module-resolver",
        {
          alias: {
            "@": "./src",
            "expo-font": "./src/shims/expo-font",
            "zustand": "./node_modules/zustand/index.js"
          }
        }
      ],
      "react-native-reanimated/plugin"
    ]
  };
};
