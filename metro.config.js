const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// inlineRem 16 keeps any rem-based utility the same size as on the web (NativeWind defaults to 14)
module.exports = withNativeWind(config, { input: './src/global.css', inlineRem: 16 });
