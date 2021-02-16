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
            this.apply(startRule);
            return true;
        } catch (e) {
            if (e === fail) return false;
            throw e;
        }
    }

    apply(rule) {
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

    _not(pred) {
        const pos = this.mark();
        try { pred() } catch(e) {
            if (e !== fail) throw e;
            this.reset(pos);
            return true;
        }
        throw fail;
    }

    end() {
        return this._not(() => this.apply('anything'));
    }

    atEndOfStream() {
        return this.pos === this.stream.length;
    }
}