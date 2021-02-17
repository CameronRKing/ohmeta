const Grammar = require('./Grammar.js');

const baseMetaGrammar = `grammar: rule+ ENDMARKER
rule: name ':' alternative ('|' alternative)* NEWLINE
alternative: item+
item: name | string
name: \\w+`;


class BootstrapParser extends Grammar {
    grammar() {
        return this._many1(() => this._apply('rule'));
    }

    rule() {
        const name = this._apply('name');
        this.token(':');
        this._apply('spaces');
        const alt = this._apply('alternative');
        const alts = this._many(() => {
            this.token('|');
            this._apply('spaces');
            return this._apply('alternative');
        });
        alts.unshift(alt);
        this.token(';');
        return { name, alts };
    }

    alternative() {
        return this._many1(() => this._apply('item'));
    }


    item() {
        this._opt(() => this._apply('spaces'));
        return this._or(
            () => this._apply('name'),
            () => this._apply('string')
        );
    }

    name() {
        return this._many1(() => this._apply('letter'));
    }

    // assume strings contain no quotes
    string() {
        this.token("'");
        const str = this._many1(() => this._apply('char'));
        this.token("'");
        return str;
    }
}

module.exports = BootstrapParser;