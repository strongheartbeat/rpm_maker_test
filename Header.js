var fs = require('fs'),
    util = require('util'),
    AbsHeader = require('./AbstractHeader');

(function (){

    function Header() {
        AbsHeader.call(this);

        this.TAG = {
            NAME: {
                code: 1000,
                type: this.TYPE.STRING
            },
            VERSION: {
                code: 1001,
                type: this.TYPE.STRING
            },
            RELEASE: {
                code: 1002,
                type: this.TYPE.STRING
            },
            EPOCH: {
                code: 1003,
                type: this.TYPE.INT32
            },
            SUMMARY: {
                code: 1004,
                type: this.TYPE.I18NSTRING
            },
            DESCRIPTION: {
                code: 1005,
                type: this.TYPE.I18NSTRING
            },
            BUILDTIME: {
                code: 1006,
                type: this.TYPE.INT32
            },
            BUILDHOST: {
                code: 1007,
                type: this.TYPE.STRING
            },
            SIZE: {
                code: 1009,
                type: this.TYPE.INT32
            },
            DISTRIBUTION: {
                code: 1010,
                type: this.TYPE.STRING
            },
            VENDOR: {
                code: 1010,
                type: this.TYPE.STRING
            },
            LICENSE: {
                code: 1010,
                type: this.TYPE.STRING
            },
            PACKAGER: {
                code: 1010,
                type: this.TYPE.STRING
            },
            GROUP: {
                code: 1010,
                type: this.TYPE.STRING
            },
            CHANGELOG: {
                code: 1010,
                type: this.TYPE.STRING
            },
            URL: {
                code: 1010,
                type: this.TYPE.STRING
            },
            OS: {
                code: 1010,
                type: this.TYPE.STRING
            },
            ARCH: {
                code: 1010,
                type: this.TYPE.STRING
            },
            SOURCERPM: {
                code: 1010,
                type: this.TYPE.STRING
            },
            FILEVERIFYFLAGS: {
                code: 1010,
                type: this.TYPE.STRING
            },
            ARCHIVESIZE: {
                code: 1010,
                type: this.TYPE.STRING
            },
            RPMVERSION: {
                code: 1010,
                type: this.TYPE.STRING
            },
            CHANGELOGTIME: {
                code: 1010,
                type: this.TYPE.STRING
            },
            CHANGELOGNAME: {
                code: 1080,
                type: this.TYPE.STRING
            },
            CHANGELOGTEXT: {
                code: 1082,
                type: this.TYPE.STRING
            },
            COOKIE: {
                code: 1094,
                type: this.TYPE.STRING
            },
            OPTFLAGS: {
                code: 1122,
                type: this.TYPE.STRING
            },
            PAYLOADFORMAT: {
                code: 1124,
                type: this.TYPE.STRING
            },
            PAYLOADCOMPRESSOR: {
                code: 1125,
                type: this.TYPE.STRING
            },
            PAYLOADFLAGS: {
                code: 1126,
                type: this.TYPE.STRING
            },
            RHNPLATFORM: {
                code: 1131,
                type: this.TYPE.STRING
            },
            PLATFORM: {
                code: 1132,
                type: this.TYPE.STRING
            },
            FILECOLORS: {
                code: 1140,
                type: this.TYPE.STRING
            },
            FILECLASS: {
                code: 1141,
                type: this.TYPE.STRING
            },
            CLASSDICT: {
                code: 1142,
                type: this.TYPE.STRING
            },
            FILEDEPENDSX: {
                code: 1143,
                type: this.TYPE.STRING
            },
            FILEDEPENDSN: {
                code: 1144,
                type: this.TYPE.STRING
            },
            DEPENDSDICT: {
                code: 1145,
                type: this.TYPE.STRING
            },
            SOURCEPKGID: {
                code: 1146,
                type: this.TYPE.STRING
            },
            FILECONTEXTS: {
                code: 1147,
                type: this.TYPE.STRING_ARRAY
            }
        };
    }

    util.inherits(Header, AbsHeader);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Header;
    }

    Header.prototype = {
        printTags : function() {
            console.log(this.TAG);
        }
    }

    // new Header().printTags();
}());
