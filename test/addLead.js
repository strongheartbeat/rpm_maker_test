var Lead = require('../Lead')
    , util = require('util')
    , path = require('path')
    , fstream = require('fstream')
    , tar = require('tar')
    , zlib = require('zlib')
    , CombinedStream = require('combined-stream')
    , EventEmitter = require('events').EventEmitter
    , Signature = require('../Signature')
    , Header = require('../Header')
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

var arStream = CombinedStream.create();

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
    console.log("Combining lead and tar.gz");
    arStream.append(buf);

    console.log("Adding Signature Header...");
    _addSigHeader();

    _addHeader();

    var tarStream = fstream.Reader({path: tarFile, type: 'File'});
    arStream.append(tarStream);

    var output = fstream.Writer(path.join(__dirname, rpmName));
    arStream.pipe(output);
}

function _addSigHeader() {
    // Header structure header (16)
    // Index Entries (16 * N)
    // Store

    var entries = [];
    var sig = new Signature();
    entries.push(_makeEntry(sig.TAG.SIGSIZE, 29458));
    entries.push(_makeEntry(sig.TAG.MD5, 'e5658a423a05b679284eeb7cf8b9827d'));

    var storeSize = 0;
    for(i in entries) {
         // console.log("ent:", util.inspect(entries[ent]));
         storeSize += (entries[i].size * entries[i].count);
    }
    console.log("Signature Header ...")
    var HeadStHeaderSize = 0;
    for ( f in HeadStHeader.fieldSize ) {
        HeadStHeaderSize += HeadStHeader.fieldSize[f]
    }
    console.log("(storeSize):", storeSize);
    console.log("Signature Header Size:", HeadStHeaderSize);
    var sigHSbuf = new Buffer(HeadStHeaderSize);
    _writeToBuf(HeadStHeader, sigHSbuf, 'magic', 0x8EADE801);
    _writeToBuf(HeadStHeader, sigHSbuf, 'reserved', ' ');
    _writeToBuf(HeadStHeader, sigHSbuf, 'entriesCount', entries.length);
    _writeToBuf(HeadStHeader, sigHSbuf, 'storeSize', storeSize);

    arStream.append(sigHSbuf);

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
        entries[i].offset = (i === 0)? 0 : ( (entries[i - 1].size) * (entries[i - 1].count) );
        _writeToBuf(IndexEntry, idxEntryBuf, 'offset', entries[i].offset);
        _writeToBuf(IndexEntry, idxEntryBuf, 'count', entries[i].count);
        idxEntriesBuf.push(idxEntriesBuf);
        arStream.append(idxEntryBuf);
    }

    var writeIntFunc = 'write';
    var writeIntFuncs = {
        1: 'writeInt8',
        2: 'writeInt16BE',
        4: 'writeInt32BE'
    };

    var storeBuf = new Buffer(storeSize);
    // var baseOff = IndexEntrySize * entries.length;
    for(i in entries) {
        var val = entries[i].value;
        if (typeof val !== 'string') {
            if (writeIntFuncs[entries[i].size]) writeIntFunc = writeIntFuncs[entries[i].size];
            else console.error("Not found !!", fieldSize);
        }
        storeBuf[writeIntFunc](val, entries[i].offset, entries[i].size);
    }
    arStream.append(storeBuf);
}

function _addHeader() {
    // Header structure header (16)
    // Index Entries (16 * N)
    // Store

    var entries = [];
    var header = new Header();
    // entries.push(_makeEntry(header.TAG.HEADERI18NTABLE, 'C'));
    entries.push(_makeEntry(header.TAG.BUILDTIME, 123456));
    entries.push(_makeEntry(header.TAG.RPMVERSION, '4.4.2'));
    entries.push(_makeEntry(header.TAG.PAYLOADFORMAT, 'cpio'));
    entries.push(_makeEntry(header.TAG.PAYLOADCOMPRESSOR, 'gzip'));

    entries.push(_makeEntry(header.TAG.NAME, 'app-test'));
    entries.push(_makeEntry(header.TAG.VERSION, '3.0'));
    entries.push(_makeEntry(header.TAG.RELEASE, 'release'));
    entries.push(_makeEntry(header.TAG.EPOCH, '2015'));
    entries.push(_makeEntry(header.TAG.BUILDHOST, 'localhost'));

    entries.push(_makeEntry(header.TAG.ARCH, 'NOARCH'));
    entries.push(_makeEntry(header.TAG.OS, 'LINUX'));
    entries.push(_makeEntry(header.TAG.PLATFORM, 'NOARCH-LINUX'));
    entries.push(_makeEntry(header.TAG.RHNPLATFORM, 'NOARCH'));

    var storeSize = 0;
    for(i in entries) {
         storeSize += (entries[i].size * entries[i].count);
    }
    console.log("Header ...")
    var HeadStHeaderSize = 0;
    for ( f in HeadStHeader.fieldSize ) {
        HeadStHeaderSize += HeadStHeader.fieldSize[f]
    }
    console.log("(storeSize):", storeSize);
    console.log("Header Size:", HeadStHeaderSize);
    var hSbuf = new Buffer(HeadStHeaderSize);
    _writeToBuf(HeadStHeader, hSbuf, 'magic', 0x8EADE801);
    _writeToBuf(HeadStHeader, hSbuf, 'reserved', ' ');
    _writeToBuf(HeadStHeader, hSbuf, 'entriesCount', entries.length);
    _writeToBuf(HeadStHeader, hSbuf, 'storeSize', storeSize);

    arStream.append(hSbuf);

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
        entries[i].offset = (i === 0)? 0 : ( (entries[i - 1].size) * (entries[i - 1].count) );
        _writeToBuf(IndexEntry, idxEntryBuf, 'offset', entries[i].offset);
        _writeToBuf(IndexEntry, idxEntryBuf, 'count', entries[i].count);
        idxEntriesBuf.push(idxEntriesBuf);
        arStream.append(idxEntryBuf);
    }

    var writeIntFunc = 'write';
    var writeIntFuncs = {
        1: 'writeInt8',
        2: 'writeInt16BE',
        4: 'writeInt32BE'
    };

    var storeBuf = new Buffer(storeSize);
    // var baseOff = IndexEntrySize * entries.length;
    for(i in entries) {
        var val = entries[i].value;
        if (typeof val !== 'string') {
            if (writeIntFuncs[entries[i].size]) writeIntFunc = writeIntFuncs[entries[i].size];
            else console.error("Not found !!", fieldSize);
        }
        // console.log("writeIntFuncs:", entries[i].offset);
        storeBuf[writeIntFunc](val, entries[i].offset, entries[i].size);
    }
    arStream.append(storeBuf);
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
