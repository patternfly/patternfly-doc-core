import eslintPluginAstro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';
import reactCompiler from 'eslint-plugin-react-compiler';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import eslintPluginPrettierRecommended from 'eslint-config-prettier';

export default [
  {
    ignores: [
        '**/dist',
        '**/css',
        '.astro/*',
        '.history/*',
        '**/.cache',
        "**/*.d.ts",
    ]
  },
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...tseslint.configs.recommended,
  reactRecommended,
  eslintPluginPrettierRecommended,
  ...eslintPluginAstro.configs.recommended,
  {
        files: ["*.astro"],
        // ...
        processor: "astro/client-side-ts", // <- Uses the "client-side-ts" processor.
        rules: {
          'react-compiler/react-in-jsx-scope': 'off',
          'react-hooks/jsx-uses-react': 'off',
        },
      },
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-compiler': reactCompiler
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
        ...reactHooks.configs.recommended.rules,
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/array-type': 'error',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/no-duplicate-enum-values': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_'
          }
        ],
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/prefer-for-of': 'off',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/unified-signatures': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'arrow-body-style': 'error',
        camelcase: [
          'error',
          {
            ignoreDestructuring: true
          }
        ],
        'constructor-super': 'error',
        curly: 'error',
        'dot-notation': 'error',
        eqeqeq: ['error', 'smart'],
        'guard-for-in': 'error',
        'max-classes-per-file': ['error', 1],
        'max-len': 'off',
        'no-nested-ternary': 'error',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-cond-assign': 'error',
        'no-console': 'error',
        'no-debugger': 'error',
        'no-empty': 'error',
        'no-eval': 'error',
        'no-new-wrappers': 'error',
        'no-prototype-builtins': 'off',
        'no-shadow': 'off',
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'off',
        'no-undef-init': 'error',
        'no-constant-binary-expression': 'off',
        'no-unsafe-finally': 'error',
        'no-unused-expressions': [
          'error',
          {
            allowTernary: true,
            allowShortCircuit: true
          }
        ],
        'no-unused-labels': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'one-var': 'off',
        'prefer-const': 'error',
        radix: ['error', 'as-needed'],
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 0,
        'react/display-name': 0,
        'react-compiler/react-compiler': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
        'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
        "react/no-unknown-property": ["error", { ignore: ["class", "transition:animate"] }],
        'spaced-comment': 'error',
        'use-isnan': 'error',
        'valid-typeof': 'off',
        'spaced-comment': 'off',
      }
  },
];