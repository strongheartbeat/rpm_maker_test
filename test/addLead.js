var Lead = require('../Lead')
    , util = require('util')
    , path = require('path')
    , fstream = require('fstream')
    , tar = require('tar')
    , zlib = require('zlib')
    , CombinedStream = require('combined-stream')
    , EventEmitter = require('events').EventEmitter
    , Signature = require('../Signature')
    , AbstractHeader = require('../AbstractHeader')
    , HeadStHeader = require('./HeaderStructureHeader')
    , IndexEntry = require('./IndexEntry')

// console.log(util.inspect(Lead.fields));
util.inherits(this, EventEmitter);

var appDir = path.join(__dirname, 'app');
var tarFile = path.join(__dirname, 'app.tar.gz');
fstream
    .Reader( {path: appDir, type: 'Directory'})
    .pipe(tar.Pack({}))
    .pipe(zlib.createGzip())
    .pipe(fstream.Writer(tarFile))
    .on('close', _end)
    .on('error', _error)

function _end() {
    console.log(path.basename(tarFile) + " has been made...");
    this.on('lead', _addLead);
    this.emit('lead');
}

function _error() {
    console.log("error:", e);
}

function _addLead() {
    console.log("Adding Lead Header ...");
    var leadSize = 0;
    for ( f in Lead.fieldSize ) {
        leadSize += Lead.fieldSize[f]
    }
    console.log("leadSize:", leadSize);

    console.log("Writing lead header to buffer...");
    var rpmName = 'app-test.rpm'
    var buf = new Buffer(leadSize);
    _writeToBuf(Lead, buf, 'magic', 0xEDABEEDB);
    _writeToBuf(Lead, buf, 'major', 1);
    _writeToBuf(Lead, buf, 'minor', 3);
    _writeToBuf(Lead, buf, 'type', 0);
    _writeToBuf(Lead, buf, 'archnum', 1);
    _writeToBuf(Lead, buf, 'name', rpmName);
    _writeToBuf(Lead, buf, 'osnum', 1);
    _writeToBuf(Lead, buf, 'signature_type', 1);
    _writeToBuf(Lead, buf, 'reserved', ' ');

    console.log("buf:", buf);

    // console.log("typeof('test'): ", typeof 'test');
    // console.log("typeof(0x1234): ", typeof 0x1234);
    var arStream = CombinedStream.create();
    console.log("Combining lead and tar.gz");
    arStream.append(buf);

    console.log("Adding Signature Header...");
    arStream.append(_getSigHeader());

    var tarStream = fstream.Reader({path: tarFile, type: 'File'});
    arStream.append(tarStream);

    var output = fstream.Writer(path.join(__dirname, rpmName));
    arStream.pipe(output);
}

function _getSigHeader() {
    // Header structure header (16)
    // Index Entries (16 * N)
    // Store

    var entries = [];
    var sig = new Signature();
    entries.push(_makeEntry(sig.TAG.SIGSIZE, 29458));
    entries.push(_makeEntry(sig.TAG.MD5, 'e5658a423a05b679284eeb7cf8b9827d'));

    var storeSize = 0;
    for(entry in entries) {
         // console.log("ent:", util.inspect(entries[ent]));
         storeSize += (entry.size * entry.count);
    }
    console.log("Signature Header ...")
    var HeadStHeaderSize = 0;
    for ( f in HeadStHeader.fieldSize ) {
        HeadStHeaderSize += HeadStHeader.fieldSize[f]
    }
    console.log("Signature Header Size:", HeadStHeaderSize);
    var sigHSbuf = new Buffer(HeadStHeaderSize);
    _writeToBuf(HeadStHeader, sigHSbuf, 'magic', 0x8EADE801);
    _writeToBuf(HeadStHeader, sigHSbuf, 'reserved', ' ');
    _writeToBuf(HeadStHeader, sigHSbuf, 'entriesCount', entry.length);
    _writeToBuf(HeadStHeader, sigHSbuf, 'storeSize', storeSize);

    // return sigHSbuf;
    var IndexEntrySize = 0;
    for ( f in IndexEntry.fieldSize ) {
        IndexEntrySize += IndexEntry.fieldSize[f]
    }
    console.log("IndexEntrySize:", IndexEntrySize);
    // var entriesBuf = new Buffer(entries.length * IndexEntrySize);
    var idxEntriesBuf = [];
    for (var i=0; i < entries.length; i++) {
        var idxEntryBuf = new Buffer(IndexEntrySize);
        _writeToBuf(IndexEntry, idxEntryBuf, 'tag', entries[i].tag.code);
        _writeToBuf(IndexEntry, idxEntryBuf, 'type', entries[i].tag.type);
        var offset = (i === 0)? 0 : ( (entries[i - 1].size) * (entries[i - 1].count) );
        _writeToBuf(IndexEntry, idxEntryBuf, 'offset', offset);
        _writeToBuf(IndexEntry, idxEntryBuf, 'count', entries[i].count);
        idxEntriesBuf.push(idxEntriesBuf);
    }
    return sigHSbuf + idxEntriesBuf.join();
}

function _makeEntry(tag, value) {
    var obj = {};
    obj.tag = tag;
    obj.value = value;
    var tagUtil = new AbstractHeader();
    tagUtil.setTagSize(obj, tag.type, value)
    console.log("tag:", tag, ",obj.size:", obj.size)
    return obj;
}

function _writeToBuf(Ref, buf, fName, value) {
    var fieldSize = Ref.fieldSize[Ref.fields[fName]];
    var fieldOff = Ref.fieldOffs[Ref.fields[fName]];

    var writeIntFunc = 'write';
    var writeIntFuncs = {
        1: 'writeInt8',
        2: 'writeInt16BE',
        4: 'writeInt32BE'
    };

    if (typeof value !== 'string') {
        if (writeIntFuncs[fieldSize]) writeIntFunc = writeIntFuncs[fieldSize];
        else console.error("Not found !!", fieldSize);
    }
    // console.log("off:", fieldOff, ",", "value:", value, "writeIntFunc:", writeIntFunc);
    buf[writeIntFunc](value, fieldOff, fieldSize);
}
