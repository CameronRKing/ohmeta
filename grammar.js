const fail = { toString() { return 'match failed' } };

module.exports = class Grammar {
    constructor() {
        this.stream = null;
        this.pos = null;
    }

    match(stream, startRule) {
        this.stream = stream;
        this.pos = 0;
        try {
            this._apply(startRule);
            return true;
        } catch (e) {
            if (e === fail) return false;
            throw e;
        }
    }

    _apply(rule) {
        return this[rule]();
    }

    // stream control
    mark() {
        return this.pos;
    }

    reset(pos) {
        this.pos = pos;
    }

    // rules
    anything() {
        if (this.atEndOfStream()) throw fail;
        return this.stream[this.pos++];
    }

    end() {
        return this._not(() => this._apply('anything'));
    }

    char() {
        const res = this._apply('anything');
        this._pred(() => typeof res === 'string' && res.length === 1);
        return res;
    }

    lower() {
        const res = this._apply('char');
        this._pred(() => res >= 'a' && res <= 'z');
        return res;
    }

    upper() {
        const res = this._apply('char');
        this._pred(() => res >= 'A', && res <= 'Z');
        return res;
    }

    letter() {
        return this._or(
            () => this._apply('lower'),
            () => this._apply('upper')
        );
    }

    // logical operators
    _not(pred) {
        const pos = this.mark();
        try {
            pred()
        } catch(e) {
            if (e !== fail) throw e;
            this.reset(pos);
            return true;
        }
        throw fail;
    }

    _many(pred, start) {
        var ans = start !== undefined ? [start] : [];
        while (true) {
            const pos = this.mark();
            try {
                ans.push(pred())
            } catch (e) {
                if (e !== fail) throw e
                this.reset(pos);
                break;
            }
        }
        return ans;
    }

    _pred(pred) {
        if (pred()) return true;
        throw fail;
    }

    _or(...args) {
        const pos = this.mark();
        for (let ii = 0; ii < args.length; ii++) {
            try {
                this.reset(pos);
                return arg();
            } catch (e) {
                if (e !== fail) throw e;
            }
        }
        throw fail;
    }

    atEndOfStream() {
        return this.pos === this.stream.length;
    }
}