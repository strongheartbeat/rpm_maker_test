var f = 0
    , fields = {}
    , tag = fields.tag = f++
    , type = fields.type = f++
    , offset = fields.offset = f++
    , count = fields.count = f++
    ;

var fieldSize = {};
fieldSize[tag] = 4;
fieldSize[type] = 4;
fieldSize[offset] = 4;
fieldSize[count] = 4;

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