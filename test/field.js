var util = require('util');

function Test() {
}
module.exports = Test;

var fields = {},
    f = 0;
var ustar = fields.ustar = f++
    , ustarver = fields.ustarver = f++
    , uname = fields.uname = f++
    , devmaj = fields.gname = f++
    ;
fields[f] = null;

var fieldEnds = {}
    , fieldOffs = {}
    , fe = 0
;

Object.keys(fields).forEach(function(f) {
        if (fields[f] !== null) fields[fields[f]] = f;
        });

Test.prototype = {
    runTest : 
        function() {
            console.log("fields:", util.inspect(fields));
        }
}

new Test().runTest();
