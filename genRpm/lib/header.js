//header.js
// +-- head_entry + entries(*)

// 1. Define Tag

var headEntry = require('./head_entry')
    , entry = require('./entry')
    , merge = require('merge')

var tags = {
    NAME: { code: 1000, type: "STRING" }
    , VERSION: { code: 1001, type: "STRING" }
    , RELEASE: { code: 1002, type: "STRING" }
    , EPOCH: { code: 1003, type: "INT32" }
    , SUMMARY: { code: 1004, type: "I18NSTRING" }
    , DESCRIPTION: { code: 1005, type: "I18NSTRING" }
    , BUILDTIME: { code: 1006, type: "INT32" }
    , BUILDHOST: { code: 1007, type: "STRING" }
    , SIZE: { code: 1009, type: "INT32" }
    , DISTRIBUTION: { code: 1010, type: "STRING" }
    , VENDOR: { code: 1011, type: "STRING" }
    , LICENSE: { code: 1014, type: "STRING" }
    , PACKAGER: { code: 1015, type: "STRING" }
    // , GROUP: { code: 1016, type: "I18NSTRING" }
    , GROUP: { code: 1016, type: "STRING" }
    , CHANGELOG: { code: 1017, type: "STRING_ARRAY" }
    , URL: { code: 1020, type: "STRING" }
    , OS: { code: 1021, type: "STRING" }
    , ARCH: { code: 1022, type: "STRING" }
    , SOURCERPM: { code: 1044, type: "STRING" }
    , FILEVERIFYFLAGS: { code: 1045, type: "INT32" } //FILE
    , ARCHIVESIZE: { code: 1046, type: "INT32" }
    , RPMVERSION: { code: 1064, type: "STRING" }
    , CHANGELOGTIME: { code: 1080, type: "INT32" }
    , CHANGELOGNAME: { code: 1081, type: "STRING_ARRAY" }
    , CHANGELOGTEXT: { code: 1082, type: "STRING_ARRAY" }
    , COOKIE: { code: 1094, type: "STRING" }
    , OPTFLAGS: { code: 1122, type: "STRING" }
    , PAYLOADFORMAT: { code: 1124, type: "STRING" }
    , PAYLOADCOMPRESSOR: { code: 1125, type: "STRING" }
    , PAYLOADFLAGS: { code: 1126, type: "STRING" } //? ["9"]
    , RHNPLATFORM: { code: 1131, type: "STRING" }
    , PLATFORM: { code: 1132, type: "STRING" }
    , FILECOLORS: { code: 1140, type: "INT32" }
    , FILECLASS: { code: 1141, type: "INT32" }
    , CLASSDICT: { code: 1142, type: "STRING" }
    , FILEDEPENDSX: { code: 1143, type: "INT32" }
    , FILEDEPENDSN: { code: 1144, type: "INT32" }
    , DEPENDSDICT: { code: 1145, type: "INT32" }
    , SOURCEPKGID: { code: 1146, type: "BIN" }
    , FILECONTEXTS: { code: 1147, type: "STRING_ARRAY" } //FILE

    , HEADERIMMUTABLE: { code: 63, type: "BIN" }
    , HEADERI18NTABLE: { code: 100, type: "STRING_ARRAY" }

    , PREINSCRIPT: { code: 1023, type: "STRING" }
    , POSTINSCRIPT: { code: 1024, type: "STRING" }
    , PREUNSCRIPT: { code: 1025, type: "STRING" }
    , POSTUNSCRIPT: { code: 1026, type: "STRING" }
    , PREINPROG: { code: 1085, type: "STRING" }
    , POSTINPROG: { code: 1086, type: "STRING" }
    , PREUNPROG: { code: 1087, type: "STRING" }
    , POSTUNPROG: { code: 1088, type: "STRING" }

    , PRETRANSSCRIPT: { code: 1151, type: "STRING" }
    , POSTTRANSSCRIPT: { code: 1152, type: "STRING" }
    , PRETRANSPROG: { code: 1153, type: "STRING" }
    , POSTTRANSPROG: { code: 1154, type: "STRING" }

    , TRIGGERSCRIPTS: { code: 1065, type: "STRING_ARRAY" }
    , TRIGGERNAME: { code: 1066, type: "STRING_ARRAY" }
    , TRIGGERVERSION: { code: 1067, type: "STRING_ARRAY" }
    , TRIGGERFLAGS: { code: 1068, type: "INT32" }
    , TRIGGERINDEX: { code: 1069, type: "INT32" }
    , TRIGGERSCRIPTPROG: { code: 1092, type: "STRING_ARRAY" }

    , OLDFILENAMES: { code: 1027, type: "STRING_ARRAY" }
    , FILESIZES: { code: 1028, type: "INT32" } //FILE
    , FILEMODES: { code: 1030, type: "INT16" } //FILE
    , FILERDEVS: { code: 1033, type: "INT16" } //FILE
    , FILEMTIMES: { code: 1034, type: "INT32" } //FILE
    , FILEMD5S: { code: 1035, type: "STRING_ARRAY" } //FILE
    , FILELINKTOS: { code: 1036, type: "STRING_ARRAY" } //FILE
    , FILEFLAGS: { code: 1037, type: "INT32" } //FILE
    , FILEUSERNAME: { code: 1039, type: "STRING_ARRAY" } //FILE
    , FILEGROUPNAME: { code: 1040, type: "STRING_ARRAY" } //FILE
    , FILEDEVICES: { code: 1095, type: "INT32" } //FILE
    , FILEINODES: { code: 1096, type: "INT32" } //FILE
    , FILELANGS: { code: 1097, type: "STRING_ARRAY" } //FILE
    , PREFIXES: { code: 1098, type: "STRING_ARRAY" }
    , DIRINDEXES: { code: 1116, type: "INT32" } //FILE
    , BASENAMES: { code: 1117, type: "STRING_ARRAY" } //FILE
    , DIRNAMES: { code: 1118, type: "STRING_ARRAY" } //FILE

    , PROVIDENAME: { code: 1047, type: "STRING_ARRAY" }
    , REQUIREFLAGS: { code: 1048, type: "INT32" }
    , REQUIRENAME: { code: 1049, type: "STRING_ARRAY" }
    , REQUIREVERSION: { code: 1050, type: "STRING_ARRAY" }
    , CONFLICTFLAGS: { code: 1053, type: "INT32" }
    , CONFLICTNAME: { code: 1054, type: "STRING_ARRAY" }
    , CONFLICTVERSION: { code: 1055, type: "STRING_ARRAY" }
    , OBSOLETENAME: { code: 1090, type: "STRING_ARRAY" }
    , PROVIDEFLAGS: { code: 1112, type: "INT32" }
    , PROVIDEVERSION: { code: 1113, type: "STRING_ARRAY" }
    , OBSOLETEFLAGS: { code: 1114, type: "INT32" }
    , OBSOLETEVERSION: { code: 1115, type: "STRING_ARRAY" }
};

function Header() {
    this.offset = 0;
    this.entries = [];
}

Header.prototype = {
    createEntry : function(tag, value) {
        var e = {}; //tag, type, count, offset
        e.tag = tags[tag].code;
        e.typeStr = tags[tag].type;
        e.type = parseInt(entry.types[tags[tag].type], 10);
        e.value = value;
        // e.count = entry.getCount(e.typeStr, e.value);
        // e.bufSize = entry.getBufferSize(e.typeStr, e.value, e.count);
        // e.buf = new Buffer(e.bufSize);
        // e.buf.fill('\x00');
        // writeToStoreBuf(e.buf, e);
        this.entries.push(e);
    },

    getBuffer : function() {
        //*************** store
        var self = this;
        var storeBuffers = [];
        var offset = 0
            , padSize = 0
            , reAlign = false
            , buf;
        // var prevStr = false;
        
        function _AddIntBuf(bound, e) {
            
            if (reAlign === true && bound > 1) {
                padSize = (offset % bound === 0)? 0 : bound - (offset % bound);
                if (padSize > 0)  {
                    buf = new Buffer(padSize).fill('\x00');
                    storeBuffers.push(buf);
                    offset += padSize;
                }
            }
            
            reAlign = false;
            e.offset = offset;
            var vs = [].concat(e.value);
            vs.forEach(function(v) {
                e.count++;
                buf = new Buffer(bound).fill('\x00');
                buf.writeUIntBE(v, 0, bound);
                offset += buf.length;
                storeBuffers.push(buf);
            });
        }
        
        self.entries.forEach(function(e) {
            e.count = 0;
            var buf = null
                , bound = 0;
                
            switch(e.typeStr) {
                case "INT8": _AddIntBuf(1, e); break;
                case "INT16": _AddIntBuf(2, e); break;
                case "INT32": _AddIntBuf(4, e); break;
                case "INT64": _AddIntBuf(8, e); break;
                case "CHAR":
                    reAlign = true;
                    e.offset = offset;
                    e.count = e.value.length;
                    buf = new Buffer(e.value);
                    offset += buf.length;
                    storeBuffers.push(buf);
                    break;
                case "BIN":
                    reAlign = true;
                    e.offset = offset;
                    e.count = e.value.length / 2; //FIXME
                    buf = new Buffer(e.value, 'hex');
                    offset += buf.length;
                    storeBuffers.push(buf);
                    break;
                case "STRING": 
                case "I18NSTRING":
                case "STRING_ARRAY": 
                {
                    reAlign = true;
                    e.offset = offset;
                    var vs = [].concat(e.value);
                    vs.forEach(function(v) {
                        e.count++;
                        buf = new Buffer(v + '\x00');
                        offset += buf.length;
                        storeBuffers.push(buf);
                    });
                    break;
                }
                default:
                    throw new Error("Not supported type#", e.typeStr);
                    break;
            }
        });
/*
        self.entries.map(function(e) {
            if (prevStr === true && (e.typeStr.indexOf("INT") === 0)) {
                var typeSize = entry.typeSize[e.typeStr];
                if (typeSize > 1) {
                    padSize = (typeSize - (offset % typeSize)) % typeSize;
                    if (padSize > 0) console.log("e.typeStr:", e.typeStr, ",pad:", padSize, ",e.value:", e.value);
                    var padding = new Buffer(padSize);
                    padding.fill('\x00');
                    storeBuffers.push(padding);
                    // console.log("!!!padSize:", padSize, ", typeSize:", typeSize);
                    offset += padSize;
                }
            }
            
            e.offset = offset;
            storeBuffers.push(e.buf);
            offset += e.bufSize;
            if (["STRING", "STRING_ARRAY", "I18NSTRING"].indexOf(e.typeStr) !== -1) {
                storeBuffers.push(new Buffer('\x00'));
                offset += 1;
                prevStr = true;
            } else prevStr = false;
        });
*/

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
                
    //BIN
    if (ent.typeStr === "BIN") {
        buf[writeFunc](value, 'hex');
        return;
    }

    if (!(value instanceof Array)) {
        fieldSize = entry.typeSize[ent.typeStr] || value.length;
        buf[writeFunc](value, 0, fieldSize);
    } else {
        var offset = 0;
        fieldSize = entry.typeSize[ent.typeStr] || ent.value[0].length;
        value.forEach(function(v) {
            buf[writeFunc](v, offset, fieldSize);
            offset += fieldSize;
        });
    }
}

module.exports = new Header();