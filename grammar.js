const fail = { toString() { return 'match failed' } };

class Failer {
    constructor() {
        this.used = false;
    }
}

module.exports = class Grammar {
    constructor() {
        this.fail = fail;
        this.stream = null;
        this.pos = null;
        this.memoTable = {};
    }

    match(stream, startRule, args, matchFailed) {
        return this._genericMatch(stream, startRule, args, matchFailed);
    }

    _genericMatch(stream, rule, args=[], matchFailed=null) {
        this.stream = stream;
        this.pos = 0;
        try {
            return args.length === 0 ? this._apply(rule)
                : this._applyWithArgs(rule, args)
        } catch (e) {
            if (e === fail) {
                if (typeof matchFailed === 'function') {
                    // probably want to parse a stack trace to indicate where we are in the rule application process too
                    return matchFailed(this, this.mark());                    
                } else {
                    return false;
                }
            }
            throw e;
        } finally {
            this.stream = null;
            this.pos = null;
            this.memoTable = {};
        }
    }

    _apply(rule) {
        const memoLoc = `${this.mark()}-${rule}`;
        let memo = this.memoTable[memoLoc];
        if (memo === undefined) {
            const originalPos = this.mark();
            const failer = new Failer();

            if (this[rule] === undefined)
                throw `Tried to apply undefined rule "${rule}"`;

            // set up potential to grow a left-recursive seed
            this.memoTable[memoLoc] = failer;

            const ans = this[rule]();
            const nextInput = this.mark();

            this.memoTable[memoLoc] = memo = { ans, nextInput };

            // try to grow the seed
            if (failer.used) {
                const sentinel = this.mark();
                while (true) {
                    try {
                        this.reset(originalPos);
                        const ans = this[rule]();
                        // if the rule application didn't succeed, quit growing
                        if (this.mark() === sentinel) throw fail;
                        memo.ans = ans;
                        memo.nextInput = this.mark();
                    } catch (e) {
                        if (e !== fail) throw e;
                        break;
                    }
                }
            }
        } else if (memo instanceof Failer) {
            memo.used = true;
            throw fail;
        }

        this.reset(memo.nextInput);

        return memo.ans;
    }

    // not memoized, so can't be left-recursive
    _applyWithArgs(rule, ...args) {
        // original definition was somewhat more complex
        // I have no idea why it prepended "extra" arguments to the stream in reverse order
        return this[rule](...args);
    }

    // also not memoized
    _superApplyWithArgs(parent, rule, ...args) {
        return parent[rule](...args);
        // curious--in the original,
        // the function on the current object
        // is applied with `this` set to the parent
        // ... but wouldn't that mean we call this version of the fn, not the parent's?
        // only additional calls inside the current fn
        // would be dispatched to the parent
    }

    // stream control
    mark() {
        return this.pos;
    }

    reset(pos) {
        this.pos = pos;
    }

    atEndOfStream() {
        return this.pos === this.stream.length;
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
        this._pred(() => 'a' <= res && res <= 'z');
        return res;
    }

    upper() {
        const res = this._apply('char');
        this._pred(() => 'A' <= res && res <= 'Z');
        return res;
    }

    letter() {
        return this._or(
            () => this._apply('lower'),
            () => this._apply('upper')
        );
    }

    space() {
        const res = this._apply('char');
        this._pred(() => res.match(/\s/));
        return res;
    }

    spaces() {
        return this._many(() => this._apply('space'));
    }

    token(str) {
        this._apply('spaces');
        return this._applyWithArgs('seq', str);
    }

    seq(seq) {
        for (let ii = 0; ii < seq.length; ii++) {
            this._applyWithArgs('exactly', seq[ii]);
        }
        return seq;
    }

    exactly(wanted) {
        if (this._apply('anything') === wanted) return wanted;
        throw fail;
    }

    // this was split into two functions in the original
    // digit for string digits, number for actual numbers
    digit() {
        const res = this._apply('anything');

        const isStrDigit = typeof res === 'string' && '0' <= res && res <= '9';
        const isActualNumber = typeof res === 'number';
        this._pred(() => isStrDigit || isActualNumber);

        return res;
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

    _lookahead(pred) {
        const pos = this.mark();
        const res = pred();
        this.reset(pos);
        return res;
    }

    // aka ?
    _opt(pred) {
        const pos = this.mark();
        let ans;
        try {
            ans = pred();
        } catch (e) {
            if (e !== fail) throw e;
            this.reset(pos);
        }
        return ans;
    }

    // aka star (*)
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

    // aka plus (+)
    _many1(pred) {
        return this._many(pred, pred());
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
                return args[ii]();
            } catch (e) {
                if (e !== fail) throw e;
            }
        }
        throw fail;
    }


    // tbh, I have no idea what these three do or why they exist
    _consumedBy() {
        throw 'todo';
    }

    _idxConsumedBy() {
        throw 'todo';
    }

    _interleave() {
        throw 'todo';
    }
}