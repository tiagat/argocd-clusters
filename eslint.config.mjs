import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.builtin,

    },
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      'no-console': 'error'
    }
  },
];
