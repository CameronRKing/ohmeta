const o = require('ospec');
const Grammar = require('./Grammar.js');

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
            valid: [['\t', 'tab'], [' ', 'space']],
            invalid: [['\n', 'newline'], emptyStr, emptyArr, ['s', 'letter'], ['1', 'digit']]
        });
    });

    o('matches multiple whitespace', () => {
        // since spaces uses many() behind the scenes, it's hard to test invalid rules
        testRule({
            ruleName: 'spaces',
            valid: [['\t\t', 'tabs'], ['  ', 'spaces']],
            invalid: []
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
    });

    o('matches object properties', () => {
        const makeTest = (prop, matcher) => {
            return function() {
                return this._obj([{ prop, matcher: matcher.bind(grammar) }]);
            }
        }
        grammar.objSeq = makeTest('foo', function() { return this._applyWithArgs('seq', 'bar') });

        testRule({
            ruleName: 'objSeq',
            valid: [[[{ foo: 'bar' }], 'valid seq']],
            invalid: [
                [[{ foo: 'bbar' }], 'invalid seq'],
                [[{ foo: {} }], 'wrong type'],
                [[{ bar: 'baz' }], 'undefined prop']
            ]
        });

        grammar.objNested = makeTest('foo', function() {
            return this._obj([{
                prop: 'bar',
                matcher: (function() { return this._apply('letter'); }).bind(grammar)
            }]);
        });

        testRule({
            ruleName: 'objNested',
            valid: [
                [[{ foo: { bar: 'z' } }], 'valid nested object']
            ],
            invalid: [
                [[{ foo: { bar: '1' } }], 'nested object with invalid property'],
                [[{ foo: { baz: 'z' } }], 'nested object with undefined property'],
                [[{ foo: '1' }], 'missing nested object']
            ]
        });
    });
})