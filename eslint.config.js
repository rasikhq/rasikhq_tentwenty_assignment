const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const tseslint = require('typescript-eslint');

module.exports = defineConfig([
  expoConfig,
  {
    // Type-aware rules, such as no-floating-promises for an un-awaited render() or user.press()
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      // Global type augmentation, such as React Navigation's root param list, merges an empty
      // interface into a declared namespace
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      // Type imports go through import statements, which also keeps `import('...')` types from
      // slipping past no-restricted-imports below
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    // The config files at the root are CommonJS run by Node
    files: ['*.config.js'],
    languageOptions: { globals: { __dirname: 'readonly' } },
  },
  {
    // Only the API module knows TMDb's JSON shapes. The test fakes stand in for TMDb, so they do too.
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/api/**', 'src/test/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/tmdbTypes', '**/tmdbTypes.*'],
              message: 'Only src/api may use TMDb response types. Import the app types it maps them into.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['android/', 'ios/', '.expo/', 'dist/'],
  },
]);
