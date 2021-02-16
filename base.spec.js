const o = require('ospec');
const Grammar = require('./grammar.js');

const testRule = ({ grammar, valid, invalid, ruleName }) => {
    valid.forEach(([seed, msg]) => {
        o(grammar.match(seed, ruleName))
            .equals(true)(`${ruleName} matches ${msg}`);
    });

    invalid.forEach(([seed, msg]) => {
        o(grammar.match(seed, ruleName))
            .equals(false)(`${ruleName} doesnt match ${msg}`);
    });
}

o.spec('base', () => {
    let grammar;
    o.beforeEach(() => grammar = new Grammar());

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
            grammar,
            ruleName: 'anything',
            valid: oneItem,
            invalid: empty,
        });
    });

    o('matches end', () => {
        testRule({
            grammar,
            ruleName: 'end',
            valid: empty,
            invalid: oneItem
        });
    });

    o('matches char', () => {
        testRule({
            grammar,
            ruleName: 'char',
            valid: [['s', 'one letter'], ['0', 'one digit'], ['$', 'one symbol']],
            invalid: [emptyStr, emptyArr, [[{}], 'array containing empty object']],
        });
    });

    o('matches lowercase letter', () => {
        testRule({
            grammar,
            ruleName: 'lower',
            valid: [['s', 'lowercase letter']],
            invalid: [emptyStr, emptyArr, ['S', 'uppercase letter'], ['1', 'digit']]
        });
    });

    o('matches uppercase letter', () => {
        testRule({
            grammar,
            ruleName: 'upper',
            valid: [['S', 'uppercase letter']],
            invalid: [emptyStr, emptyArr, ['s', 'lowercase letter'], ['1', 'digit']]
        });
    });

    o('matches digit', () => {
        testRule({
            grammar,
            ruleName: 'digit',
            valid: [['1', 'string 1'], [[1], 'number 1']],
            invalid: [['s', 'character', emptyStr, emptyArr]]
        });
    })

    o('matches many (*)', () => {
        grammar.star = function() {
            return this._many(() => this._apply('anything'));
        };

        testRule({
            grammar,
            ruleName: 'star',
            valid: oneItem.concat(twoItems).concat(empty),
            invalid: [], // is it possible for this rule to fail?
        });
    })
})