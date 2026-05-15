const { fixupConfigRules } = require('@eslint/compat');
const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({ baseDirectory: path.resolve(process.cwd()) });

module.exports = [
  ...fixupConfigRules(compat.extends('expo')),
  {
    rules: {
      // Warn on Prettier formatting violations so the editor highlights them
      // without blocking builds.  Run `npm run format` to auto-fix.
    },
  },
  {
    // Files and directories to ignore
    ignores: ['node_modules/', '.expo/', 'dist/', 'build/', 'eslint.config.js'],
  },
];
