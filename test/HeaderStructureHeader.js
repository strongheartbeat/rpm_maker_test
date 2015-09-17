var f = 0
    , fields = {}
    , magic = fields.magic = f++
    , reserved = fields.reserved = f++
    , entriesCount = fields.entriesCount = f++
    , storeSize = fields.storeSize = f++
    ;

var fieldSize = {};
fieldSize[magic] = 4;
fieldSize[reserved] = 4;
fieldSize[entriesCount] = 4;
fieldSize[storeSize] = 4;

var fieldEnds = {}
    , fieldOffs = {}
    , fe = 0
    ;

for (var i = 0; i < f; i++) {
    fieldOffs[i] = fe;
    fieldEnds[i] = (fe += fieldSize[i]);
}

Object.keys(fields).forEach(function (f) {
    if (fields[f] !== null) fields[fields[f]] = f;
});

module.exports.fields = fields;
module.exports.fieldSize = fieldSize;
module.exports.fieldOffs = fieldOffs;
module.exports.fieldEnds = fieldEnds;