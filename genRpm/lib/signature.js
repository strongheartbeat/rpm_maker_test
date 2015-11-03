//signature.js
// +-- head_entry + entries(*)

// 1. Define Tag 

var headEntry = require('./head_entry')
    , entry = require('./entry')
    , merge = require('merge')

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
}

Signature.prototype = {
    createEntry : function(tag, value) {
        var e = {}; //tag, type, count, offset
        e.tag = tags[tag].code;
        e.typeStr = tags[tag].type;
        e.type = parseInt(entry.types[tags[tag].type], 10);
        e.value = value;
        e.count = entry.getCount(e.typeStr, e.value);
        e.bufSize = entry.getBufferSize(e.typeStr, e.value, e.count);
        e.buf = new Buffer(e.bufSize);
        e.buf.fill('\x00');
        writeToStoreBuf(e.buf, e);
        this.entries.push(e);
    },

    getBuffer : function() {
        //*************** store
        var self = this;
        var storeBuffers = [];
        var offset = 0
            , padSize = 0;
        self.entries.map(function(e) {
            // if (["STRING", "STRING_ARRAY", "I18NSTRING"].indexOf(e.typeStr) !== -1) {
            //     padSize = offset % 4;
            //     var padding = new Buffer(padSize);
            //     padding.fill('\x00');
            //     storeBuffers.push(padding);
            //     offset += padSize;
            // }
            e.offset = offset;
            storeBuffers.push(e.buf);
            offset += e.bufSize;
            if (["STRING", "STRING_ARRAY", "I18NSTRING"].indexOf(e.typeStr) !== -1) {
                storeBuffers.push(new Buffer('\x00'));
                offset += 1;
            }
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
        this._writeToBuf(headEntry, this.headBuf, 'storeSize', offset);

        return Buffer.concat([this.headBuf, this.entriesBuf].concat(storeBuffers));
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
    }
}

function writeToStoreBuf(buf, ent) {
    var writeFunc
        , value
        , fieldSize;

    value = (ent.value instanceof Array)?  ent.value[0] : ent.value;
    writeFunc = (typeof ent.value[0] === 'string')? 'write' : 'writeUIntBE';

    value = (ent.value instanceof Array && writeFunc === 'write')? 
                ent.value.join('\x00') : ent.value;

    if (!(value instanceof Array)) {
        fieldSize = entry.typeSize[ent.typeStr] || value.length;
        buf[writeFunc](value, 0, fieldSize);
    } else {
        var offset = 0;
        fieldSize = entry.typeSize[ent.typeStr] || ent.value[0].length;
        for (v in ent.value) {
            buf[writeFunc](value, offset, fieldSize);
            offset += fieldSize;
        }
    }
}

module.exports = new Signature();