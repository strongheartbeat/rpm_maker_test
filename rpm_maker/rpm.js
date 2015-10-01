var lead = require('./lead')
    , signature = require('./signature')
    , header = require('./header')
    , head_entry = require('./head_entry')
    , entry = require('./entry')
    , util = require('util')
    , path = require('path')
    , fs = require('fs')
    , fstream = require('fstream')
    , recursive = require('recursive-readdir')
    , tar = require('tar')
    , zlib = require('zlib')
    , cpio = require('cpio-stream')
    , CombinedStream = require('combined-stream')
    , EventEmitter = require('events').EventEmitter;

function Rpm() {
    EventEmitter.call(this);
}

util.inherits(Rpm, EventEmitter);

Rpm.prototype = {
    _makeRpm: function() {
        var stat = fs.lstatSync(this.tarFile);
        console.log("this.contents:", this.contents);

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

        // console.log("[ByJunil] ", buf);

        // Signature
        signature.createEntry("LEGACY_SIGSIZE", stat.size);
        signature.createEntry("PAYLOADSIZE", stat.size);
        // signature.createEntry("LEGACY_SIGSIZE", 12345);
        // signature.createEntry("PAYLOADSIZE", 0);
        signature.createBuffer();
        var sigBufs = [].concat(signature.headBuf).concat(signature.entriesBuf).concat(signature.storeBuf);
        // console.log("[ByJunil-sig] ", Buffer.concat(sigBufs));

        // header
        header.createEntry("BUILDTIME", Math.floor(new Date().getTime()/1000));
        header.createEntry("RPMVERSION", "4.4.2");
        header.createEntry("PAYLOADFORMAT", "cpio");
        // header.createEntry("PAYLOADFORMAT", "tar");
        header.createEntry("PAYLOADCOMPRESSOR", "gzip");
        header.createEntry("NAME", "wow");
        header.createEntry("VERSION", "1.0");
        header.createEntry("RELEASE", "1");
        // header.createEntry("EPOCH", 0);

        header.createEntry("BUILDHOST", "localhost");
        header.createEntry("SIZE", 0);
        header.createEntry("ARCH", "noarch");
        header.createEntry("OS", "linux");
        header.createEntry("PLATFORM", "noarch-linux");
        header.createEntry("RHNPLATFORM", "noarch");
        header.createEntry("LICENSE", "MIT");
        header.createEntry("PAYLOADFLAGS", "9");

        var dirNames = this.contents.map(function (c) {
            return c.dirname;
        });
        var basenames = this.contents.map(function (c) {
            return c.basename;
        });
        header.createEntry("DIRNAMES", dirNames);
        header.createEntry("BASENAMES", basenames);

        // header.createEntry("PROVIDENAME", ["wow"]);
        // header.createEntry("PROVIDEVERSION", ["0:1.0-1"]);  
        // header.createEntry("PROVIDEFLAGS", 0x08);
        // header.createEntry("PROVIDEFLAGS", 0);

        header.createBuffer();
        var headerBufs = [].concat(header.headBuf).concat(header.entriesBuf).concat(header.storeBuf);
        // console.log("[ByJunil-header] ", Buffer.concat(headerBufs));

        var arStream = CombinedStream.create();
        arStream.append(buf);
        arStream.append(Buffer.concat(sigBufs));
        arStream.append(Buffer.concat(headerBufs));

        //Archive
        var tarStream = fstream.Reader({path: this.tarFile, type: 'File'});
        arStream.append(tarStream);

        // rpm
        var output = fstream.Writer(path.join(__dirname, rpmName));
        arStream.pipe(output);
    },

    _readAppDir : function() {
        var self = this;
        var appDir = path.join(__dirname, 'wowapp');
        recursive(appDir, function (err, files) {
            var entryFiles = files.map(function(file) {
                obj = {};
                obj.dirname = path.relative(__dirname, path.dirname(file));
                obj.basename = path.basename(file);
                return obj;
            });
            self.contents = entryFiles;
            self._makeArchieve();
        });
    },

    _makeArchieve : function() {
        var self = this;
        var appDir = path.join(__dirname, 'wowapp');
        var tarFile = path.join(__dirname, 'app.tar.gz');
        self.tarFile = tarFile;

        // fstream
        //     .Reader( {path: appDir, type: 'Directory'})
        //     .pipe(tar.Pack({}))
        //     .pipe(zlib.createGzip())
        //     .pipe(fstream.Writer(tarFile))
        //     .on('close', _end)
        //     .on('error', _error)

        var cpioFile = path.join(__dirname, 'app.cpio');
        fstream
            .Reader({path: cpioFile, type: 'File'})
            .pipe(zlib.createGzip())
            .pipe(fstream.Writer(tarFile))
            .on('close', _end)
            .on('error', _error)

        function _end() {
            console.log(path.basename(tarFile) + " has been made...");
            this.on('lead', self._makeRpm.bind(self));
            this.emit('lead');
        }

        function _error() {
            console.log("error:", e);
        }
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

var rpm = new Rpm();
// rpm._makeRpm();
rpm._readAppDir();
// rpm._makeArchieve();
