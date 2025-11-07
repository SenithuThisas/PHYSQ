const nativewind = require("nativewind/babel");

module.exports = function (api) {
  api.cache(true);
  const { plugins: nativewindPlugins = [] } = nativewind();

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ...nativewindPlugins.filter((plugin) => plugin !== "react-native-worklets/plugin"),
      [
        "module-resolver",
        {
          alias: {
            "@": "./src"
          }
        }
      ],
      "react-native-reanimated/plugin"
    ]
  };
};
