module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', '@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'airbnb-base',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    rules: {
        quotes: [2, 'single', {avoidEscape: true}],
        indent: ['error', 4],
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-empty-function': 'off', // пустые конструкторы банит
        'import/no-unresolved': 'off', // не понимает нормально пути
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': 'off',
        'no-useless-constructor': 'off', // пустые конструкторы
        'import/prefer-default-export': 'off', // хочет всё дефолтами
        '@typescript-eslint/no-unused-vars': ['error', {ignoreRestSiblings: true}], // нест дефолт
        'object-curly-spacing': ['error', 'never'], // банит за { some } from 'some-location', правильно только {some} from 'some-location'
        'no-plusplus': [2, {allowForLoopAfterthoughts: true}], // ++ и -- только в циклах
        'no-param-reassign': ['error', {props: false}], // разрешает модифицировать параметры функций
        'max-len': [
            'error',
            {
                code: 120,
                ignoreComments: true,
                ignoreTrailingComments: true,
            },
        ],
        'object-curly-newline': ['error', {multiline: true, minProperties: 3}], // если в объекте более 2 полей, заставит писать их с новой строки
        'consistent-return': 'off', // ругает если не вернул что-то из функции, но игнорит если вернул undefined
        'no-shadow': ['warn'], // бесит, тупо бесит
        'no-restricted-syntax': 'off', // осуждает за for of => Макс крушить => off
        'no-await-in-loop': 'off', // осуждает за for of await => Макс крушить => off
        'class-methods-use-this': 'off', // осуждает, если у тебя есть не статический метод класса, а в нем нет this
        'no-unused-expressions': ['error', {allowTernary: true}], // разрешил тернарные операторы, а так название говорит за себя
        'no-console': 'error', // бан или вещ
        'lines-between-class-members': ['error', 'always', {exceptAfterSingleLine: true}], // между метожами пробел, между переменными нет
        'linebreak-style': 'off',
    },
};
