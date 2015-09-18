var fstream = require('fstream')
    , zlib = require('zlib')
    , path = require('path')
    , cpio = require('cpio-stream')
    , pack = cpio.pack();
    
var cpioFile = path.join(__dirname, 'test.cpio');
pack.entry({name: 'my-test.txt', mtime: new Date(1419354218000)}, 'hello, world\n'); 
var entry = pack.entry({name: 'my-stream-test.txt', mtime: new Date(1419354218000)}, function (err) {
              // stream was added 
              // no more entries 
              pack.finalize()
              });

entry.write('hello')
entry.write(' world')
entry.end()
// pipe the archive somewhere 
pack.pipe(zlib.createGzip())
    .pipe(fstream.Writer(cpioFile));


