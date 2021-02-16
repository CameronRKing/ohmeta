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

    const oneItem = [
        ['s', 'character'],
        [['s'], 'array with character'],
        [[{}], 'array with empty object'],
        [[[]], 'nested array'],
    ];

    const empty = [
        ['', 'empty string'],
        [[], 'empty array'],
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
})