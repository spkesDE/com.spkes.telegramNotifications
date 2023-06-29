// eslint-disable-next-line no-undef
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:homey-app/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        quotes: ['error', 'single', { 'avoidEscape': true }]
    },
    // TODO Separate config for React in telegram-settings
    ignorePatterns: ['telegram-settings/**/*.*']
};