
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

    read : function(inStream) {
        // return number of entries found
    }

    write : function(outStream) {

    }
}

if (module !== 'undefined' && module.exports) {
    module.exports = AbstractHeader;
}