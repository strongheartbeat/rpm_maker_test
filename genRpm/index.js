var 
    util = require('util')
    , Readable = require('stream').Readable
    , Writable = require('stream').Writable
    , path = require('path')
    , recursive = require('recursive-readdir')
    , fs = require('fs')
    , fstream = require('fstream')
    , async = require('async')
    , CombinedStream = require('combined-stream')
    , lead = require('./lib/lead')
    , signature = require('./lib/signature')


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
            this.genRpm.bind(this)
        ], function(err, results) {
            console.log("async end...");
        });
    },

    genRpm: function(next) {
        var self = this;
        var output = fstream.Writer(self.rpmFile);
        console.log("Generating rpm file...", self.rpmFile);
        this.rpmStream.pipe(output);
    },

    genHeader: function(next) {

    },

    genSignature: function(next) {
        var stat = fs.lstatSync(this.cpioFile);

        signature.createEntry("LEGACY_SIGSIZE", stat.size);
        signature.createEntry("PAYLOADSIZE", stat.size);
        signature.genBuffer();
        this.rpmStream.append(signature.headBuf);
        this.rpmStream.append(signature.entriesBuf);
        this.rpmStream.append(signature.storeBuf);
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
