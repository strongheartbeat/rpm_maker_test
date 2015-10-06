var str = "hello"
var str1 = "hello" + "\0"
var str2 = "hello" + null
var str3 = "hello\n"
var str4 = "hello\0"

console.log("str.length:", str.length);
console.log("str1.length:", str1.length);
console.log("str2.length:", str2.length);
console.log("str3.length:", str3.length);
console.log("str4.length:", str4.length);
