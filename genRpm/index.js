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
    , crypto = require('crypto')
    , CombinedStream = require('combined-stream')
    , lead = require('./lib/lead')
    , signature = require('./lib/signature')
    , header = require('./lib/header')
    , tar = require('tar')


process.on('uncaughtException', function(err) {
   console.log(err.stack); 
});

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
            // this.genTar.bind(this),
            this.genLead.bind(this),
            this.genSignature.bind(this),
            this.genHeader.bind(this),
            this.genRpm.bind(this),
            function(next) {
                console.log("Hang!");
                next();
            }
        ], function(err, results) {
            console.log("async end...err:", err);
            process.exit(0);
        });
    },

    genRpm: function(next) {
        var self = this;
        // var inCpio = fstream.Reader({path: self.cpioFile, type: 'File'}).pipe(zlib.createGzip());
        var inCpio = fstream.Reader({path: this.cpioFile, type: 'File'});
        var output = fstream.Writer(self.rpmFile);
        console.log("Generating rpm file...", self.rpmFile);
        self.rpmStream.append(inCpio);
        self.rpmStream.pipe(output);
        
        output.on("close", function(exit) {
                console.log("exit:", exit);
                // setTimeout(function() {
                //     console.log("no!!!!");
                // }, 15000);
                next();
            })
            .on("error", function(err) {
                console.log("err:", err);
            });
    },

    genHeader: function(next) {
        var stat = fs.lstatSync(this.cpioFile);
        // header
        header.createEntry("BUILDTIME", Math.floor(new Date().getTime()/1000));
        header.createEntry("RPMVERSION", "4.4.2");
        header.createEntry("PAYLOADFORMAT", "cpio");
        // header.createEntry("PAYLOADFORMAT", "tar");
        header.createEntry("PAYLOADCOMPRESSOR", "gzip");
        header.createEntry("NAME", "wowtest");
        header.createEntry("SOURCERPM", "wowtest");
        header.createEntry("VERSION", "1.0");
        header.createEntry("RELEASE", "1");
        // header.createEntry("EPOCH", 0);
        header.createEntry("SUMMARY", ["This is test summary"]);
        header.createEntry("DESCRIPTION", ["This is test description"]);

        header.createEntry("BUILDHOST", "localhost");
        header.createEntry("SIZE", stat.size);
        header.createEntry("ARCH", "noarch");
        header.createEntry("OS", "linux");
        header.createEntry("PLATFORM", "noarch-linux");
        header.createEntry("RHNPLATFORM", "noarch");
        header.createEntry("LICENSE", "MIT");
        header.createEntry("PAYLOADFLAGS", "9");
        // header.createEntry("SIZE", stat.size);
        
        // header.createEntry("GROUP",  "Miscellaneous");
        header.createEntry("GROUP",  "Development/Tools");

        var uniqDirNames = []
            , baseNames = []
            , idxDirs = []
            , fileSizes = []
            , fileINodes = []
            , fileModes = []
            , instPaths = []
            
        this.contents.forEach(function(c) {
            // console.log("c.stat:", c.stat);
            if (uniqDirNames.indexOf(c.dirname) === -1) {
                uniqDirNames.push(c.dirname.trim());
            }
            idxDirs.push(uniqDirNames.indexOf(c.dirname));
            // baseNames.push(c.basename);
            baseNames = baseNames.concat(c.basename);
            // baseNames.push(path.basename(c.stat.name.replace(/[\0]+$/, '')));
            console.log("c.dirname:", c.dirname, ",legnth:", c.dirname.length);
            fileSizes.push(c.stat.size);
            fileINodes.push(c.stat.ino);
            fileModes.push(c.stat.mode);
            instPaths.push(c.instPath);
        });
        
        //FILEUSERNAME, FILEGROUPNAME
        var fileOwners = Array.apply(null, {length: baseNames.length}).map(function(){return 'root'});
        // console.log("this.contents.length:", this.contents.length);
        header.createEntry("FILEUSERNAME", fileOwners);
        header.createEntry("FILEGROUPNAME", fileOwners);
                
        
        // console.log("baseNames:", baseNames);
        // console.log("uniqDirNames:", uniqDirNames);
        // console.log("idxDirs:", idxDirs);
        // console.log("baseNames:", baseNames);
        header.createEntry("DIRINDEXES", idxDirs);     
        header.createEntry("BASENAMES", baseNames);
        header.createEntry("DIRNAMES", uniqDirNames);   
        // header.createEntry("DIRNAMES", ["/ivi/app/com.yourdomain.app/"]);

        header.createEntry("FILESIZES", fileSizes);
        header.createEntry("FILEINODES", fileINodes);
        header.createEntry("FILEMODES", fileModes);
        
        // header.createEntry("SIZE", stat.size);
        
        this.rpmStream.append(header.getBuffer());
        next();
    },

    genSignature: function(next) {
        var stat = fs.lstatSync(this.cpioFile);
        var data = fs.readFileSync(this.cpioFile);
        var md5 = crypto.createHash('md5');
        md5.update(data);
        var hash = md5.digest('hex');
        console.log("MD5:", hash);

        // signature.createEntry("LEGACY_SIGSIZE", stat.size);
        var sigSize = (96 + 64 + 4 + 4 + 32) + stat.size;
        console.log("!!!!!!!!!!!! sigSize:", sigSize, ", payloadSize:", stat.size);
        signature.createEntry("LEGACY_SIGSIZE", sigSize );
        signature.createEntry("PAYLOADSIZE", stat.size);
        // signature.createEntry("LEGACY_MD5", hash);
        this.rpmStream.append(signature.getBuffer());
        // var padSize = (sigSize % 4 === 0)? 0 : (4 - (sigSize % 4));
        // console.log("!!!!!!!!!!!! padSize:", padSize);
        // var dummyBuf = new Buffer(padSize);
        // dummyBuf.fill('\x00');
        // if (padSize > 0) this.rpmStream.append(dummyBuf);
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
    
    genTar: function(next) {
        var self = this;
        var appDir = self.inDir;
        var tarFile = self.cpioFile;
        
        recursive(this.inDir, function(err, files) {
                var entryFiles = files.map(function(file) {
                    obj = {};
                    var relPath = path.relative(self.inDir, path.dirname(file));
                    relPath = (relPath === '')? relPath : relPath + '/';
                    obj.dirname = path.join(self.instDir, relPath).replace(/[\\]/g,'/');
                    // obj.dirname = path.join(self.instDir, path.dirname(file)).replace(/[\\]/g,'/');
                    // console.log("[!!]:", obj.dirname);
                    obj.basename = path.basename(file);
                    obj.instPath = path.join(obj.dirname, obj.basename).replace(/[\\]/g,'/');
                    obj.origPath = file;
                    obj.stat = fs.lstatSync(file);
                    return obj;
                 });
                self.contents = entryFiles;
                
                fstream
                    .Reader( {path: appDir, type: 'Directory'})
                    .pipe(tar.Pack({}))
                    // .pipe(zlib.createGzip()) //zip here ?
                    .pipe(fstream.Writer(tarFile))
                    .on('close', _end)
                    .on('error', _error)
                    ;
                
                    function _end() {
                        console.log("tar packing end...");
                        next();
                    }
                    function _error(e) {
                        console.error("tar packing error:", e);
                        next(e);
                    }
        });
    },

    genCpio: function(next) {
        var self = this;
        console.log("preparing cpio packing for", this.inDir);
        /*
        walk(this.inDir, function(err, files) {
            // console.log("???? files:", files);
                entryFiles = files.map(function(file) {
                    obj = {};
                    var relPath = path.relative(self.inDir, path.dirname(file));
                    relPath = (relPath === '')? relPath : relPath + '/';
                    obj.dirname = path.join(self.instDir, relPath).replace(/[\\]/g,'/');
                    obj.basename = path.basename(file);
                    obj.instPath = path.join(obj.dirname, obj.basename).replace(/[\\]/g,'/');
                    obj.origPath = file;
                    obj.stat = fs.lstatSync(file);
                    return obj;
                 });
                self.contents = entryFiles;
                packCpio(entryFiles, self.cpioFile, next);
        });
        */
        
        recursive(this.inDir, function(err, files) {
                entryFiles = files.map(function(file) {
                    obj = {};
                    var relPath = path.relative(self.inDir, path.dirname(file));
                    relPath = (relPath === '')? relPath : relPath + '/';
                    obj.dirname = path.join(self.instDir, relPath).replace(/[\\]/g,'/');
                    // obj.dirname = path.join(self.instDir, path.dirname(file)).replace(/[\\]/g,'/');
                    // console.log("[!!]:", obj.dirname);
                    obj.basename = path.basename(file);
                    obj.instPath = path.join(obj.dirname, obj.basename).replace(/[\\]/g,'/');
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
        //    if (path.basename(c.stat.name) == "largeIcon.png") {console.log("??"); c.stat.name += '\x00'; c.stat.nameSize+=1 }; 
           pack.entry(c.stat, fs.readFileSync(c.origPath));
           
        //    if (c.stat.isDirectory()) {
        //         pack.entry(c.stat, null);
        //    } else {
        //         pack.entry(c.stat, fs.readFileSync(c.origPath));
        //    }
           
    });
    pack.finalize();
    pack
    //    .pipe(zlib.createGzip()) //zip here ?
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

function walk(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
                    results.push(file);
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          next();
        }
      });
    })();
  });
};

module.exports = Rpm;

var opts = {
    'cpio': {
        inDir: 'wowapp',
        outDir: __dirname,
        outFileName : 'wow.cpio',
        instDir: '/app/webapp/good/'
        // instDir: '/ivi/app/com.yourdomain.app/'
    },
    'rpm': {
        outDir: __dirname,
        outFileName : 'wowtest.rpm'
    }
};
var rpmTest = new Rpm(opts);
rpmTest.exec();