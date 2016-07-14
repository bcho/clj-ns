'use strict';


class Parser {
  constructor(src) {
    this.src = src
      .replace(/\n/g, ' ')
      .replace(/\t/g, ' ');
  }

  getNS() {
    const matched = /\(ns ([^\ ]+).*\)$/.exec(this.src);
    if (!matched) return '*unknown-ns*';
    return matched[1].trim();
  }

  getDeps() {
    return {
      requires: this._getRequires(),
      imports: this._getImports(),
      uses: this._getUses(),
    };
  }

  _getRequires() {
    let rv = [];

    let remains = this.src.slice(0);
    while (true) {
      if (remains.length === 0) break;
      const requires = /\(:require (.*)\)/.exec(remains);
      if (!requires) break;
      remains = remains.slice(requires.index);

      const require = requires[1].substr(0, requires[1].indexOf(')'));
      rv = rv.concat(this._parseDepsFromVector(require));
      remains = remains.slice(require.length);
    }

    return rv;
  }

  _getImports() {
    let rv = [];

    let remains = this.src.slice(0);
    while (true) {
      if (remains.length === 0) break;
      const imports = /\(:import (.*)\)/.exec(remains);
      if (!imports) break;
      remains = remains.slice(imports.index);

      const imp = imports[1].substr(0, imports[1].indexOf(')'));
      rv = rv.concat(this._parseDepsFromVector(imp));
      remains = remains.slice(imp.length);
    }

    return rv;
  }

  _getUses() {
    let rv = [];

    let remains = this.src.slice(0);
    while (true) {
      if (remains.length === 0) break;
      const uses = /\(:use (.*)\)/.exec(remains);
      if (!uses) break;
      remains = remains.slice(uses.index);

      const use = uses[1].substr(0, uses[1].indexOf(')'));
      rv = rv.concat(this._parseDepsFromVector(use));
      remains = remains.slice(use.length);
    }

    return rv;
  }

  _parseDepsFromVector(vector) {
    const deps = [];
    let vectorLevel = 0;
    let i = -1;
    while (true) {
      if (i >= vector.length) break;
      i = i + 1;
      const c = vector[i];

      if (c === '[') {
        vectorLevel += 1;
        while (vector[i + 1] === ' ') i = i + 1;
        let ns = '';
        if (vectorLevel === 1) {
          while (vector[i + 1] !== ' ') {
            ns = ns + vector[i + 1];
            i = i + 1;
          }
          deps.push(ns);
        }
      }
      if (c === ']') vectorLevel -= 1;
    }

    return deps;
  }
}

module.exports = {
  Parser,
};
