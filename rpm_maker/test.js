var idx = ["hello" , "his", "name"];
console.log(Object.keys(idx));

var num = 10;
//console.log(num.length);
var str = "abadfs";
console.log("str len:", str.length);

var data = 0x1234;
var buf = new Buffer(4); //.fill('\x00');
buf.fill('\x00');
console.log(buf);
buf.writeUIntBE(data, 0, 2);
console.log(buf);
