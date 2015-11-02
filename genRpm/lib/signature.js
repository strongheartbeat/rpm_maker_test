//signature.js
// +-- head_entry + entries(*)

// 1. Define Tag 

var headEntry = require('./head_entry')
    , entry = require('./entry')
    , merge = require('merge')
    , stream = require('stream')

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

function Signature() {
    this.offset = 0;
    this.entries = [];
    this.head = {};
}

Signature.prototype = {
    createEntry : function(tag, value) {
        var e = {}; //tag, type, count, offset
        e.tag = tags[tag].code;
        e.typeStr = tags[tag].type;
        e.type = parseInt(entry.types[tags[tag].type], 10);
        e.value = value;
        e.count = entry.getCount(e.typeStr, e.value);
    },

    genBuffer : function() {
        //*************** store
        var storeStream = new stream.Readable();
        this.entries.forEach(function(e) {

        });

        //*************** entries (16 bytes * N)
        var entryUnitSize = 0;
        for ( f in entry.fieldSize ) {
            entryUnitSize += entry.fieldSize[f]
        }
        var entriesSize = entryUnitSize * this.entries.length;
        this.entriesBuf = new Buffer(entriesSize);

        // ==> Fill entry buffer
        var baseOffset = 0, count = 0;
        for ( e in this.entries ) {
            baseOffset = (count++) * entryUnitSize;
            this._writeToBuf(entry, this.entriesBuf, 'tag', this.entries[e].tag, baseOffset);
            this._writeToBuf(entry, this.entriesBuf, 'type', this.entries[e].type, baseOffset);
            this._writeToBuf(entry, this.entriesBuf, 'offset', this.entries[e].offset, baseOffset);
            this._writeToBuf(entry, this.entriesBuf, 'count', this.entries[e].count, baseOffset);

            //store
            this._writeToStoreBuf(this.storeBuf, this.entries[e].value, this.entries[e].typeSize, this.entries[e].bufSize, this.entries[e].offset);
        }

        //*************** head (16 bytes)
        var headSize = 0;
        for ( f in headEntry.fieldSize ) {
            headSize += headEntry.fieldSize[f]
        }
        this.headBuf = new Buffer(headSize);

        // ==> Fill head buffer
        this._writeToBuf(headEntry, this.headBuf, 'magic', 0x8EADE801);
        this._writeToBuf(headEntry, this.headBuf, 'reserved', '');
        this._writeToBuf(headEntry, this.headBuf, 'entriesCount', this.entries.length);
        this._writeToBuf(headEntry, this.headBuf, 'storeSize', storeBufSize);
    },

    _writeToBuf : function(prot, buf, fName, value, baseOff) {
        if (!baseOff) baseOff = 0;
        var fieldSize = prot.fieldSize[prot.fields[fName]];
        var fieldOff = (baseOff + prot.fieldOffs[prot.fields[fName]]);
         var writeFunc = 'write';
        if (typeof value !== 'string') {
            writeFunc = 'writeUIntBE'
        }
        buf[writeFunc](value, fieldOff, fieldSize);
        if (writeFunc === 'write' && value.length < fieldSize) {
            buf['fill']('\x00', fieldOff + value.length);
        }
    },

    _writeToStoreBuf : function(buf, value, typeSize, fieldSize, fieldOff) {
        var writeFunc = 'write';
        if (value instanceof Array) {
            if ('string' !== typeof value[0]) {
                writeFunc = 'writeUIntBE';
                for (v in value) {
                    buf[writeFunc](value[v], fieldOff, typeSize);
                    fieldOff += typeSize;
                }
                return;
            } else {
                value = value.join('\0');
            }
        } else if ('string' !== typeof value) {
            writeFunc = 'writeUIntBE';
        }
        buf[writeFunc](value, fieldOff, fieldSize);
        if ( 'write' === writeFunc && value.length < fieldSize) {
            buf['fill']('\x00', fieldOff + value.length);
        }
    }
}

module.exports = new Signature();