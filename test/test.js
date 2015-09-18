var fstream = require('fstream');

var buf = new Buffer(10);
console.log("buf:", buf);

var version = "4.3.1";
console.log("version.length:", version.length);
console.log("W:", buf.write(version, 2, version.length + 1));
console.log("(W)buf:", buf);
console.log("W:", buf.write("kML", 7, "kML".length , 'utf8'));
//buf.write(version, 0, version.length, 'utf8');
console.log("Text:", buf.toString('utf8', 2, buf.length + 1));
//console.log("Text:", buf.toString('utf8', 0, version.length));

var output = fstream.Writer('./good.bin');
output.write(buf);

