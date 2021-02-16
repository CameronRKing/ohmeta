module.exports = class Grammar {
    constructor() {
        this.stream = null;
        this.pos = null;
    }

    match(stream, startRule) {
        this.stream = stream;
        this.pos = 0;
        return this.apply(startRule);
    }

    apply(rule) {
        return this[rule]();
    }

    anything() {
        return this.stream[this.pos++];
    }
}