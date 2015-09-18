#!/usr/bin/env node

var uniqueID = (function() {
        var id = 0;
        return function() { return id++; };
})();

console.log(uniqueID());
console.log(uniqueID());
