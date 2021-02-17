const o = require('ospec');
const Grammar = require('./grammar.js');

o.spec('base', () => {
    let grammar;
    o.beforeEach(() => grammar = new Grammar());

    const testRule = ({ valid, invalid, ruleName }) => {
        valid.forEach(([seed, msg]) => {
            o(!!grammar.match(seed, ruleName))
                .equals(true)(`${ruleName} matches ${msg}`);
        });

        invalid.forEach(([seed, msg]) => {
            o(!!grammar.match(seed, ruleName))
                .equals(false)(`${ruleName} doesnt match ${msg}`);
        });
    }

    const emptyStr = ['', 'empty string'];
    const emptyArr = [[], 'empty array'];

    const oneItem = [
        ['s', 'character'],
        [['s'], 'array with character'],
        [[{}], 'array with empty object'],
        [[[]], 'nested array'],
    ];

    const twoItems = [
        ['st', 'two characters'],
        [['s', 't'], 'array with two characters'],
        [[{}, {}], 'array with two empty objects'],
        [[[], []], 'array with two nested arrays']
    ];

    const empty = [
        emptyStr,
        emptyArr,
    ];

    o('matches anything', () => {
        testRule({
            ruleName: 'anything',
            valid: oneItem,
            invalid: empty,
        });
    });

    o('matches end', () => {
        testRule({
            ruleName: 'end',
            valid: empty,
            invalid: oneItem
        });
    });

    o('matches char', () => {
        testRule({
            ruleName: 'char',
            valid: [['s', 'one letter'], ['0', 'one digit'], ['$', 'one symbol']],
            invalid: [emptyStr, emptyArr, [[{}], 'array containing empty object']],
        });
    });

    o('matches lowercase letter', () => {
        testRule({
            ruleName: 'lower',
            valid: [['s', 'lowercase letter']],
            invalid: [emptyStr, emptyArr, ['S', 'uppercase letter'], ['1', 'digit']]
        });
    });

    o('matches uppercase letter', () => {
        testRule({
            ruleName: 'upper',
            valid: [['S', 'uppercase letter']],
            invalid: [emptyStr, emptyArr, ['s', 'lowercase letter'], ['1', 'digit']]
        });
    });

    o('matches any-case letter', () => {
        testRule({
            ruleName: 'letter',
            valid: [['S', 'uppercase'], ['s', 'lowercase']],
            invalid: [['1', 'digit'], [' ', 'whitespace']]
        });
    })

    o('matches digit', () => {
        testRule({
            ruleName: 'digit',
            valid: [['1', 'string 1'], [[1], 'number 1']],
            invalid: [['s', 'character', emptyStr, emptyArr]]
        });
    });

    o('matches single whitespace', () => {
        testRule({
            ruleName: 'space',
            valid: [['\n', 'newline'], ['\t', 'tab'], [' ', 'space']],
            invalid: [emptyStr, emptyArr, ['s', 'letter'], ['1', 'digit']]
        });
    });

    o('matches multiple whitespace', () => {
        testRule({
            ruleName: 'spaces',
            valid: [['\n\n', 'newlines'], ['\t\t', 'tabs'], ['  ', 'spaces'], ['\n', 'single newline']],
            invalid: [['s', 'single character'], emptyStr]
        });
    });

    o('matches many (*)', () => {
        grammar.star = function() {
            return this._many(() => this._apply('anything'));
        };

        testRule({
            ruleName: 'star',
            valid: oneItem.concat(twoItems).concat(empty),
            invalid: [], // is it possible for this rule to fail?
        });
    })
})