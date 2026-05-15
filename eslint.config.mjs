// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

export default withNuxt(
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  {
    files: ['tests/**/*.{ts,vue}', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
)
