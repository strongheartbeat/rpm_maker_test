var path = require('path')
    , recursive = require('recursive-readdir')
    , fs = require('fs')
    , fstream = require('fstream')

//console.log(process.argv);

var appDir
    , entryFiles
    , obj
    ;

if (process.argv.length > 2) {
    appDir = path.resolve(process.argv[2]);
}
console.log("appDir:", appDir);

recursive(appDir, function(err, files) {
        entryFiles = files.map(function(file) {
            obj = {};
            obj.dirname = '/ivi/app/com.wow.app/';
            obj.basename = path.basename(file);
            obj.instPath = obj.dirname + obj.basename;
            obj.origPath = file;
            obj.stat = fs.lstatSync(file);
            return obj;
         });
        _packCpio();
});

function _packCpio() {
   var PackNewc = require('cpio-stream/pack-newc').PackNewc;
   var newc = require('cpio-stream/headers').newc;
   var pack = new PackNewc({"cpioCodec" : newc });

   entryFiles.forEach(function(c) {
           c.stat.nameSize = c.instPath.length;
           c.stat.name = c.instPath;
           //console.log("c.stat.name:", c.stat.name);
           pack.entry(c.stat, fs.readFileSync(c.origPath));
   });
   pack.finalize();
   pack
       .pipe(fstream.Writer(path.join(__dirname, "wowapp.cpio")))
       .on('lose', _end)
       .on('error', _error)
       ;

   function _end() {
       console.log("end...");
   }
   function _error(e) {
       console.error("error:", e);
   }
}



