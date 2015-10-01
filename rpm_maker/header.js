//header.js
// +-- head_entry + entries(*)

// 1. Define Tag

var headEntry = require('./head_entry')
    , entry = require('./entry')

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
    , GROUP: { code: 1016, type: "I18NSTRING" }
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
    , FILEINODES: { code: 1096, type: "INT64" } //FILE
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
        e.type = parseInt(entry.types[tags[tag].type], 10);
        e.value = value;
        e.count = entry.getCount(e.type, value);
        e.bufSize = entry.getBufferSize(e.type, value);
        this.entries.push(e);
    },

    createBuffer : function() {
        //*************** store
        var storeBufSize = 0;
        this.entries.forEach(function(e) {
            e.offset = storeBufSize;
            storeBufSize += e.bufSize;
        });
        var paddingSize = (storeBufSize % 8 === 0)? 0: (8-(storeBufSize % 8));
        this.storeBuf = new Buffer(storeBufSize + paddingSize);
        this.storeBuf.fill('\x00');

        //*************** entries (16 bytes * N)
        var entryUnitSize = 0;
        for ( f in entry.fieldSize ) {
            entryUnitSize += entry.fieldSize[f]
        }
        var entriesSize = entryUnitSize * this.entries.length;
        paddingSize = (entriesSize % 8 === 0)? 0: (8-(entriesSize % 8));
        this.entriesBuf = new Buffer(entriesSize + paddingSize);

        // ==> Fill entry buffer
        var baseOffset = 0, count = 0;
        for ( e in this.entries ) {
            baseOffset = (count++) * entryUnitSize;
            this._writeToBuf(entry, this.entriesBuf, 'tag', this.entries[e].tag, baseOffset);
            this._writeToBuf(entry, this.entriesBuf, 'type', this.entries[e].type, baseOffset);
            this._writeToBuf(entry, this.entriesBuf, 'offset', this.entries[e].offset, baseOffset);
            this._writeToBuf(entry, this.entriesBuf, 'count', this.entries[e].count, baseOffset);

            //store
            this._writeToStoreBuf(this.storeBuf, this.entries[e].value, this.entries[e].bufSize, this.entries[e].offset);
        }

        //*************** head (16 bytes)
        var headSize = 0;
        for ( f in headEntry.fieldSize ) {
            headSize += headEntry.fieldSize[f]
        }
        paddingSize = (headSize % 8 === 0)? 0: (8-(headSize % 8));
        this.headBuf = new Buffer(headSize + paddingSize);

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
        var writeIntFuncs = {
            1: 'writeUInt8',
            2: 'writeUInt16BE',
            4: 'writeUInt32BE'
        };
        if (typeof value !== 'string') {
            if (writeIntFuncs[fieldSize]) writeFunc = writeIntFuncs[fieldSize];
            else console.error("Not found !!", fieldSize);
        }
        buf[writeFunc](value, fieldOff, fieldSize);
        if (writeFunc === 'write' && value.length < fieldSize) {
            buf['fill']('\x00', fieldOff + value.length);
        }
    },

    _writeToStoreBuf : function(buf, value, fieldSize, fieldOff) {
        var writeFunc = 'write';
        var writeIntFuncs = {
            1: 'writeUInt8',
            2: 'writeUInt16BE',
            4: 'writeUInt32BE'
        };
        if (typeof value !== 'string') {
            if (writeIntFuncs[fieldSize]) writeFunc = writeIntFuncs[fieldSize];
            else console.error("Not found !!", fieldSize);
        }
        buf[writeFunc](value, fieldOff, fieldSize);
        if (writeFunc === 'write' && value.length < fieldSize) {
            buf['fill']('\x00', fieldOff + value.length);
        }
    }
}

module.exports = new Header();