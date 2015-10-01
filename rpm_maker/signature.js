//signature.js
// +-- head_entry + entries(*)

// 1. Define Tag 

var headEntry = require('./head_entry')
    , entry = require('./entry')

var tags = {
    SIGNATURES: { code: 62, type: "BIN" }
    , SIGSIZE: { code: 257, type: "INT32" }
    , LEGACY_SIGSIZE: { code: 1000, type: "INT32" } //SIG
    , PGP: { code: 259, type: "BIN" }
    , LEGACY_PGP: { code: 1002, type: "BIN" }
    , MD5: { code: 261, type: "BIN" }
    , LEGACY_MD5: { code: 1004, type: "BIN" } //SIG
    , GPG: { code: 262, type: "BIN" }
    , LEGACY_GPG: { code: 1005, type: "BIN" }
    , PAYLOADSIZE: { code: 1007, type: "INT32" } //SIG
    , SHA1HEADER: { code: 269, type: "STRING" }
    , LEGACY_SHA1HEADER: { code: 1010, type: "STRING"} //SIG
    , DSAHEADER: { code: 267, type: "BIN" }
    , LEGACY_DSAHEADER: { code: 1011, type: "BIN" }
    , RSAHEADER: { code: 268, type: "BIN" }
    , LEGACY_RSAHEADER: { code: 1012, type: "BIN" }
};
