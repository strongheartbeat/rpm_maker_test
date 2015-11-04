var
    util = require('util')
    , Readable = require('stream').Readable
    , Writable = require('stream').Writable
    , path = require('path')
    , recursive = require('recursive-readdir')
    , fs = require('fs')
    , fstream = require('fstream')
    , async = require('async')
    , zlib = require('zlib')
    , CombinedStream = require('combined-stream')
    , lead = require('./lib/lead')
    , signature = require('./lib/signature')
    , header = require('./lib/header')


// Logic
//   Make cpio
//   Make rpm
//       +- lead
//       +- signature (HeaderStructureHeader + IndexEntry (*) + Store)
//       +- header (HeaderStructureHeader + IndexEntry (*) + Store)
//       +- payload (cpio)

function Rpm(opts) {
    // Readable.call(this);

    var cpioOpts = opts.cpio || {};
    cpioOpts.outDir = cpioOpts.outDir || __dirname;
    cpioOpts.outFileName = cpioOpts.outFileName || 'wow.cpio';

    var rpmOpts = opts.rpm || {};
    rpmOpts.outDir = rpmOpts.outDir || __dirname;
    rpmOpts.outFileName = rpmOpts.outFileName || 'wow.rpm';


    this.inDir = cpioOpts.inDir || 'wowapp';
    this.instDir = cpioOpts.instDir || '/ivi/app/';
    this.cpioFile = path.resolve(path.join(cpioOpts.outDir, cpioOpts.outFileName));
    this.rpmFile = path.resolve(path.join(rpmOpts.outDir, rpmOpts.outFileName));

    this.rpmStream = CombinedStream.create();
}
// util.inherits(Rpm, Readable);

Rpm.prototype = {

    exec: function() {
        console.log("Run rpm...", this.inDir);
        async.series([
            this.genCpio.bind(this),
            this.genLead.bind(this),
            this.genSignature.bind(this),
            this.genHeader.bind(this),
            this.genRpm.bind(this)
        ], function(err, results) {
            console.log("async end...");
        });
    },

    genRpm: function(next) {
        var self = this;
        var inCpio = fstream.Reader({path: this.cpioFile, type: 'File'});
        var output = fstream.Writer(self.rpmFile);
        console.log("Generating rpm file...", self.rpmFile);
        this.rpmStream.append(inCpio);
        this.rpmStream.pipe(output);
    },

    genHeader: function(next) {
        var stat = fs.lstatSync(this.cpioFile);
        // header
        header.createEntry("BUILDTIME", Math.floor(new Date().getTime()/1000));
        header.createEntry("RPMVERSION", "4.4.2");
        header.createEntry("PAYLOADFORMAT", "cpio");
        // header.createEntry("PAYLOADFORMAT", "tar");
        header.createEntry("PAYLOADCOMPRESSOR", "gzip");
        header.createEntry("NAME", "wow21123");
        header.createEntry("VERSION", "1.0");
        header.createEntry("RELEASE", "1");
        // header.createEntry("EPOCH", 0);
        header.createEntry("SUMMARY", ["This is test summary"]);
        header.createEntry("DESCRIPTION", ["This is test description"]);

        header.createEntry("BUILDHOST", "localhost");
        // header.createEntry("SIZE", stat.size);
        header.createEntry("ARCH", "noarch");
        header.createEntry("OS", "linux");
        header.createEntry("PLATFORM", "noarch-linux");
        header.createEntry("RHNPLATFORM", "noarch");
        header.createEntry("LICENSE", "MIT");
        header.createEntry("PAYLOADFLAGS", "9");
        header.createEntry("SIZE", stat.size);

        var dirNames = this.contents.map(function (c) {
            return c.dirname;
        });
        var basenames = this.contents.map(function (c) {
            return c.basename;
        });
        var idxDirs = Object.keys(basenames).map(function(i){
            return parseInt(i);
        });
        var fileSizes = this.contents.map(function (c) {
            return c.stat.size;
        });
        var fileINodes = this.contents.map(function (c) {
            return c.stat.ino;
        });
        var fileModes = this.contents.map(function (c) {
            return c.stat.mode;
        });
        var instPaths = this.contents.map(function (c) {
            return c.instPath;
        });
        header.createEntry("DIRINDEXES", [0,0,0,0]);
        header.createEntry("BASENAMES", basenames);
        header.createEntry("DIRNAMES", ["/ivi/app/good/"]);

        // header.createEntry("FILESIZES", fileSizes);
        // header.createEntry("FILEINODES", fileINodes);
        // header.createEntry("FILEMODES", fileModes);

        this.rpmStream.append(header.getBuffer());
        next();
    },

    genSignature: function(next) {
        var stat = fs.lstatSync(this.cpioFile);

        signature.createEntry("LEGACY_SIGSIZE", stat.size);
        signature.createEntry("PAYLOADSIZE", stat.size);
        this.rpmStream.append(signature.getBuffer());
        next();
    },

    genLead: function(next) {
        var leadSize = 0;
        for ( f in lead.fieldSize ) {
            leadSize += lead.fieldSize[f]
        }
        var rpmName = path.basename(this.rpmFile);
        var buf = new Buffer(leadSize);
        buf.fill('\x00');

        writeHeaderToBuf(lead, buf, 'magic', 0xEDABEEDB);
        writeHeaderToBuf(lead, buf, 'major', 3);
        writeHeaderToBuf(lead, buf, 'minor', 0);
        writeHeaderToBuf(lead, buf, 'type', 0);
        writeHeaderToBuf(lead, buf, 'archnum', 1);
        writeHeaderToBuf(lead, buf, 'name', rpmName);
        writeHeaderToBuf(lead, buf, 'osnum', 1);
        writeHeaderToBuf(lead, buf, 'signature_type', 5);
        writeHeaderToBuf(lead, buf, 'reserved', ' ');

        this.rpmStream.append(buf);
        next();
    },

    genCpio: function(next) {
        var self = this;
        console.log("preparing cpio packing for", this.inDir);
        recursive(this.inDir, function(err, files) {
                entryFiles = files.map(function(file) {
                    obj = {};
                    obj.dirname = self.instDir;
                    obj.basename = path.basename(file);
                    obj.instPath = obj.dirname + obj.basename;
                    obj.origPath = file;
                    obj.stat = fs.lstatSync(file);
                    return obj;
                 });
                self.contents = entryFiles;
                packCpio(entryFiles, self.cpioFile, next);
        });
    }
}

function packCpio(entryFiles, cpioFile, next) {
    var PackNewc = require('cpio-stream/pack-newc').PackNewc;
    var newc = require('cpio-stream/headers').newc;
    var pack = new PackNewc({"cpioCodec" : newc });

    entryFiles.forEach(function(c) {
           c.stat.nameSize = c.instPath.length;
           c.stat.name = c.instPath;
           pack.entry(c.stat, fs.readFileSync(c.origPath));
    });
    pack.finalize();
    pack
       .pipe(zlib.createGzip()) //zip here ?
       .pipe(fstream.Writer(cpioFile))
       .on('close', _end)
       .on('error', _error)
       ;

    function _end() {
       console.log("cpio packing end...");
       next();
    }
    function _error(e) {
       console.error("cpio packing error:", e);
       next(e);
    }
}

function writeHeaderToBuf(prot, buf, fName, value) {
    var fieldSize = prot.fieldSize[prot.fields[fName]];
    var fieldOff = prot.fieldOffs[prot.fields[fName]];
    var writeFunc = (typeof value === 'string')? 'write' : 'writeUIntBE';
    buf[writeFunc](value, fieldOff, fieldSize);
}

module.exports = Rpm;

var opts = {
    'cpio': {
        inDir: 'wowapp',
        outDir: __dirname,
        outFileName : 'wow2.cpio',
        instDir: '/ivi/app/good/'
    },
    'rpm': {
        outDir: __dirname,
        outFileName : 'wow2.rpm'
    }
};
new Rpm(opts).exec();
