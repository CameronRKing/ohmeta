const o = require('ospec');
const BootstrapParser = require('./BootstrapParser.js');

o.spec('BootstrapParser', () => {
    o('does something', () => {
        const p = new BootstrapParser();

        const baseGrammar = `grammar: rule end;`;
        const res = p.match(baseGrammar, 'grammar');

        console.log(res);
    })
});