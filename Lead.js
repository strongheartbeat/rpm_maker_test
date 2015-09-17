

var f = 0
    , fields = {}
    , magic = fields.magic = f++
    , major = fields.major = f++
    , minor = fields.minor = f++
    , type = fields.type = f++
    , archnum = fields.archnum = f++
    , name = fields.name = f++
    , osnum = fields.osnum = f++
    , signature_type = fields.signature_type = f++
    , reserved = fields.reserved = f++
    ;

var fieldSize = {};
fieldSize[magic] = 4;
fieldSize[major] = 1;
fieldSize[minor] = 1;
fieldSize[type] = 2;
fieldSize[archnum] = 2;
fieldSize[name] = 66;
fieldSize[osnum] = 2;
fieldSize[signature_type] = 2;
fieldSize[reserved] = 16;

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