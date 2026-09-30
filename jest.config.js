// Packages Jest compiles from node_modules. Entries match as prefixes, so 'expo' also covers expo-font.
// The first five are the scopes from jest-expo's list that this app uses; the rest are MSW's
// ESM-only dependencies.
const compiledPackages = [
  'react-native',
  '@react-native',
  'expo',
  '@expo',
  '@react-navigation',
  'rettime',
  'until-async',
  '@open-draft/deferred-promise',
];

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    // NativeWind compiles global.css in Metro. Jest has no CSS step, and tests don't assert on styles.
    '\\.css$': '<rootDir>/src/test/emptyModule.ts',
    // msw/node maps the react-native export condition, which the React Native preset resolves with, to null
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
  },
  transform: {
    // Some of MSW's dependencies ship only .mjs files, which jest-expo's transform doesn't cover
    '\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    `/node_modules/(?!(${compiledPackages.join('|')}))`,
    // As in jest-expo
    '/node_modules/react-native-reanimated/plugin/',
  ],
};
