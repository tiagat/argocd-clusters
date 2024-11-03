import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['node_modules/**'],
    languageOptions: {
      globals: globals.builtin,

    },
    plugins: {
      unicorn: eslintPluginUnicorn,
      typescript: tseslint
    },
    rules: {
      'no-console': 'error'
    }
  },
];
