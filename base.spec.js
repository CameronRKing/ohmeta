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

    const twoItems = [
        ['st', 'two characters'],
        [['s', 't'], 'array with two characters'],
        [[{}, {}], 'array with two empty objects'],
        [[[], []], 'array with two nested arrays']
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

    o('matches char', () => {
        testRule({
            grammar,
            ruleName: 'char',
            valid: [['s', 'one letter'], ['0', 'one digit'], ['$', 'one symbol']],
            invalid: [['', 'empty string'], [[], 'empty array'], [[{}], 'array containing empty object']],
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
            invalid: [], // invalid tests will require a new rule
        });
    })
})