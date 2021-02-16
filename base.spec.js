const o = require('ospec');
const Grammar = require('./grammar.js');

o.spec('base', () => {
    let gr;
    o.beforeEach(() => gr = new Grammar());

    o('matches anything', () => {
        gr.anythingWorks = function() {
            if (this.apply('anything')) return true;
            return false;
        };

        // succeeds on valid input
        const valid = [
            ['s', 'character'],
            [['s'], 'array with character'],
            [[{}], 'array with empty object'],
            [[[]], 'nested array'],
        ];

        valid.forEach(([seed, msg]) => {
            const match = gr.match(seed, 'anythingWorks');
            o(match).equals(true)(`anything matches ${msg}`);
        });

        // fails on empty input
        const invalid = [
            ['', 'empty string'],
            [[], 'empty array'],
        ];
        invalid.forEach(([seed, msg]) => {
            const match = gr.match(seed, 'anythingWorks');
            o(match).equals(false)(`anything doesnt match ${msg}`);
        });
    });

    o('matches end', () => {
        gr.endWorks = function() {
            if (this.apply('end')) return true;
            return false;
        };

        const valid = [
            ['', 'empty string'],
            [[], 'empty array'],
        ];

        valid.forEach(([seed, msg]) => {
            const match = gr.match(seed, 'endWorks');
            o(match).equals(true)(`end matches ${msg}`);
        });

        const invalid = [
            ['s', 'character'],
            [['s'], 'array with character'],
            [[{}], 'array with empty object'],
            [[[]], 'nested array'],
        ];

        invalid.forEach(([seed, msg]) => {
            const match = gr.match(seed, 'endWorks');
            o(match).equals(false)(`end doesnt match ${msg}`);
        });
    })
})