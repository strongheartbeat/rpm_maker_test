//entry.js


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
};

Object.keys(fields).forEach(function (f) {
    if (fields[f] !== null) fields[fields[f]] = f;
});

var types = 
{
    0: "NULL",
    1: "CHAR",
    2: "INT8",
    3: "INT16",
    4: "INT32",
    5: "INT64",
    6: "STRING",
    7: "BIN",
    8: "STRING_ARRAY",
    9: "I18NSTRING",
    10: "ASN1",
    11: "OPENPGP"
};

Object.keys(types).forEach(function (t) {
    types[types[t]] = types[types[t]] || t;
});

var typeSize = {};
typeSize["NULL"] = 0;
typeSize["INT8"] = 1;
typeSize["INT16"] = 2;
typeSize["INT32"] = 4;
typeSize["INT64"] = 8;

function getBufferSize(type, value) {
    var size = 0;
    if (types[type]) type = types[type];
    if (typeSize[type]) return typeSize[type];
    switch (type) {
        case "CHAR":
        case "BIN": 
            size = value.length;
            break;
        case "STRING": 
            size = value.length + 1;
            break;
        case "STRING_ARRAY": 
            if (! value instanceof Array) throw "(getBufferSize)::" + type + "#value:" + value + " should be array type.";
            for (v in value) {
                size += (value[v].length + 1);
            }
            break;
        case "I18NSTRING":
        case "ASN1":
        case "OPENPGP":
            throw "Not supported (TBD)";
        default:
            break;
    }
    return size;
}

function getCount(type, value) {
    var count = 0;
    if (types[type]) type = types[type];
    if (typeSize[type]) return 1;
    switch (type) {
        case "CHAR":
        case "BIN": 
            count = value.length;
            break;
        case "STRING": 
        case "STRING_ARRAY":
            count = 1;
            break;
        case "I18NSTRING":
        case "ASN1":
        case "OPENPGP":
            throw "Not supported (TBD)";
        default:
            break;
    }
    return count;
}

module.exports.fields = fields;
module.exports.fieldSize = fieldSize;
module.exports.fieldOffs = fieldOffs;
module.exports.fieldEnds = fieldEnds;
module.exports.getBufferSize = getBufferSize;
module.exports.getCount = getCount;
module.exports.types = types;

