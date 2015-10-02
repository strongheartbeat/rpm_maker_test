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

function getSize(type, value) {
    var obj = {};
    obj.count = getCount(type, value);
    obj.bufSize = getBufferSize(type, value, obj.count);
    obj.typeSize = typeSize[type] || null;
    return obj;
}

function getBufferSize(type, value, count) {
    var size = 0;
    switch (type) {
        case "ASN1":
        case "OPENPGP":
            throw "Not supported (TBD) type: " + type + ", value: " + value;
        case "STRING":
        case "BIN":
        case "CHAR":
            size = value.length + 1;    //Adding escape(\0) size
            break;
        case "I18NSTRING":
        case "STRING_ARRAY":
            if (! value instanceof Array) throw type + " value should be array type. (value: " + value + ").";
            for(v in value) {
                size += (value[v].length + 1);
            }
            break;
        default:
            count = count || getCount(type, value);
            size = typeSize[type] * count;
            break;
    }
    return size;
}

function getCount(type, value) {
    var count = 0;
    if (type === "STRING") return 1; //Special case, STRING TYPE count is always 1.
    switch (type) {
        case "ASN1":
        case "OPENPGP":
            throw "Not supported (TBD) type: " + type + ", value: " + value;
        case "STRING_ARRAY":
        case "I18NSTRING":
            if (! value instanceof Array) throw type + " value should be array type. (value: " + value + ").";
            count = value.length;
            break;
        default:
            if (value instanceof Array || typeof value === 'string') {
                count = value.length;
            } else if (typeSize[type]) {
                count = 1;
            } else {
                throw "Not supported (TBD) type: " + type + ", value: " + value;
            }
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
module.exports.getSize = getSize;
module.exports.types = types;
module.exports.typeSize = typeSize;

