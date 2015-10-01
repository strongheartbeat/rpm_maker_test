var lead = require('./lead')
    , signature = require('./signature')
    , header = require('./header')
    , head_entry = require('./head_entry')
    , entry = require('./entry')
    , util = require('util')
    , path = require('path')
    , fstream = require('fstream')
    , tar = require('tar')
    , zlib = require('zlib')
    , cpio = require('cpio-stream')
    , CombinedStream = require('combined-stream')
    , EventEmitter = require('events').EventEmitter;

function Rpm() {
}

Rpm.prototype = {
    _dummyData: function() {
        // Lead
        var leadSize = 0;
        for ( f in lead.fieldSize ) {
            leadSize += lead.fieldSize[f]
        }
        var rpmName = 'wow.rpm';
        var buf = new Buffer(leadSize);

        this._writeToBuf(lead, buf, 'magic', 0xEDABEEDB);
        this._writeToBuf(lead, buf, 'major', 3);
        this._writeToBuf(lead, buf, 'minor', 0);
        this._writeToBuf(lead, buf, 'type', 0);
        this._writeToBuf(lead, buf, 'archnum', 1);
        this._writeToBuf(lead, buf, 'name', rpmName);
        this._writeToBuf(lead, buf, 'osnum', 1);
        this._writeToBuf(lead, buf, 'signature_type', 5);
        this._writeToBuf(lead, buf, 'reserved', ' ');

        console.log("[ByJunil] ", buf);

        // Signature
        signature.createEntry("LEGACY_SIGSIZE", 12345);
        signature.createBuffer();
        var sigBufs = [].concat(signature.headBuf).concat(signature.entriesBuf).concat(signature.storeBuf);
        console.log("[ByJunil-sig] ", Buffer.concat(sigBufs));

        // header
        header.createEntry("NAME", rpmName);
        header.createEntry("VERSION", "3.0");
        header.createEntry("RELEASE", "1");
        header.createEntry("BUILDHOST", "localhost");
        header.createEntry("ARCH", "NOARCH");
        header.createEntry("OS", "LINUX");
        header.createEntry("PLATFORM", "LINUX");
        header.createEntry("OS", "NOARCH-LINUX");
        // header.createEntry("RHNPLATFORM", "NOARCH");
        header.createBuffer();
        var headerBufs = [].concat(header.headBuf).concat(header.entriesBuf).concat(header.storeBuf);
        console.log("[ByJunil-header] ", Buffer.concat(headerBufs));

        var arStream = CombinedStream.create();
        arStream.append(buf);
        arStream.append(Buffer.concat(sigBufs));
        arStream.append(Buffer.concat(headerBufs));

        var output = fstream.Writer(path.join(__dirname, rpmName));
        arStream.pipe(output);
    },

    _writeToBuf : function(prot, buf, fName, value, baseOff) {
        var fieldSize = prot.fieldSize[prot.fields[fName]];
        var fieldOff = prot.fieldOffs[prot.fields[fName]];
        if (!baseOff) baseOff = 0;

        var writeFunc = 'write';
        var writeIntFuncs = {
            1: 'writeInt8',
            2: 'writeInt16BE',
            4: 'writeInt32BE'
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

module.exports = Rpm;

new Rpm()._dummyData();
