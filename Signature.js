var fs = require('fs'),
    util = require('util'),
    AbsHeader = require('./AbstractHeader');

(function (){

    function Signature() {
        AbsHeader.call(this);

        this.TAG = {
            SIGNATURES: {
                code: 62,
                type: this.TYPE.BIN
            },
            SIGSIZE: {
                code: 257,
                type: this.TYPE.INT32
            },
            LEGACY_SIGSIZE: {
                code: 1000,
                type: this.TYPE.INT32
            },
            PGP: {
                code: 259,
                type: this.TYPE.BIN
            },
            LEGACY_PGP: {
                code: 1002,
                type: this.TYPE.BIN
            },
            MD5: {
                code: 261,
                type: this.TYPE.BIN
            },
            LEGACY_MD5: {
                code: 1004,
                type: this.TYPE.BIN
            },
            GPG: {
                code: 262,
                type: this.TYPE.BIN
            },
            LEGACY_GPG: {
                code: 1005,
                type: this.TYPE.BIN
            },
            PAYLOADSIZE: {
                code: 1007,
                type: this.TYPE.INT32
            },
            SHA1HEADER: {
                code: 269,
                type: this.TYPE.STRING
            },
            LEGACY_SHA1HEADER: {
                code: 1010,
                type: this.TYPE.STRING
            },
            DSAHEADER: {
                code: 267,
                type: this.TYPE.BIN
            },
            LEGACY_DSAHEADER: {
                code: 1011,
                type: this.TYPE.BIN
            },
            RSAHEADER: {
                code: 268,
                type: this.TYPE.BIN
            },
            LEGACY_RSAHEADER: {
                code: 1012,
                type: this.TYPE.BIN
            }
        };
    }

    util.inherits(Signature, AbsHeader);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Signature;
    }

    Signature.prototype = {
        printTags : function() {
            console.log(this.TAG);
        }
    }

    // new Signature().printTags();
}());
