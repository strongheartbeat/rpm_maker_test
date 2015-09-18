
var TagType = {
    NULL: 0,
    CHAR: 1,
    INT8: 2,
    INT16: 3,
    INT32: 4,
    INT64: 5,
    STRING: 6,
    BIN: 7,
    STRING_ARRAY: 8,
    I18NSTRING: 9,
    ASN1: 10,
    OPENPGP: 11
}

function AbstractHeader() {
    this.TYPE = TagType;
    this.HEADER_HEADER_SIZE = 16;
    this.ENTRY_SIZE = 16;
    this.MAGIC_WORD = 0x8EADE801; //Magic World 0x8EADE8 and Version 01
}

AbstractHeader.prototype = {
    printTypes : function() {
        console.log(this.TYPE);
    },

    setTagSize : function(obj, type, value) {
        switch (type) {
            case TagType.NULL: 
            case TagType.CHAR:
            case TagType.INT8:
            case TagType.BIN:
                obj.size = 1; obj.count = value.length;
                break;
            case TagType.INT16:
                obj.size = 2; obj.count = 1; break;
            case TagType.INT32:
                obj.size = 4; obj.count = 1; break;
            case TagType.INT64:
                obj.size = 8; obj.count = 1; break;
            case TagType.STRING:
            case TagType.I18NSTRING:
                obj.count = 1; 
                obj.size = (value.length + 1); break;
            case TagType.ASN1:
            case TagType.OPENPGP:
                console.log("Unknown. ASN1 or OPENPGP");
                obj.size = 1; obj.count = 1; break;
            case TagType.STRING_ARRAY:
                if (! value instanceof Array) console.error("Error, STRING_ARRAY should be string array value"); process.exit(1);
                var size = 0;
                for (v in value) size += (v.length + 1);
                obj.size = size;
                obj.count = value.length;
                break;
            default:
                break;
        }
    }
}

if (module !== 'undefined' && module.exports) {
    module.exports = AbstractHeader;
}