//header.js
// +-- head_entry + entries(*)

// 1. Define Tag

var headEntry = require('./head_entry')
    , entry = require('./entry')

var tags = {
    NAME: { code: 1000, type: "STRING" }
    , VERSION: { code: 1001, type: "STRING" }
    , RELEASE: { code: 1002, type: "STRING" }
    , EPOCH: { code: 1003, type: "INT32" }
    , SUMMARY: { code: 1004, type: "I18NSTRING" }
    , DESCRIPTION: { code: 1005, type: "I18NSTRING" }
    , BUILDTIME: { code: 1006, type: "INT32" }
    , BUILDHOST: { code: 1007, type: "STRING" }
    , SIZE: { code: 1009, type: "INT32" }
    , DISTRIBUTION: { code: 1010, type: "STRING" }
    , VENDOR: { code: 1011, type: "STRING" }
    , LICENSE: { code: 1014, type: "STRING" }
    , PACKAGER: { code: 1015, type: "STRING" }
    , GROUP: { code: 1016, type: "I18NSTRING" }
    , CHANGELOG: { code: 1017, type: "STRING_ARRAY" }
    , URL: { code: 1020, type: "STRING" }
    , OS: { code: 1021, type: "STRING" }
    , ARCH: { code: 1022, type: "STRING" }
    , SOURCERPM: { code: 1044, type: "STRING" }
    , FILEVERIFYFLAGS: { code: 1045, type: "INT32" } //FILE
    , ARCHIVESIZE: { code: 1046, type: "INT32" }
    , RPMVERSION: { code: 1064, type: "STRING" }
    , CHANGELOGTIME: { code: 1080, type: "INT32" }
    , CHANGELOGNAME: { code: 1081, type: "STRING_ARRAY" }
    , CHANGELOGTEXT: { code: 1082, type: "STRING_ARRAY" }
    , COOKIE: { code: 1094, type: "STRING" }
    , OPTFLAGS: { code: 1122, type: "STRING" }
    , PAYLOADFORMAT: { code: 1124, type: "STRING" }
    , PAYLOADCOMPRESSOR: { code: 1125, type: "STRING" }
    , PAYLOADFLAGS: { code: 1126, type: "STRING" } //? ["9"]
    , RHNPLATFORM: { code: 1131, type: "STRING" }
    , PLATFORM: { code: 1132, type: "STRING" }
    , FILECOLORS: { code: 1140, type: "INT32" }
    , FILECLASS: { code: 1141, type: "INT32" }
    , CLASSDICT: { code: 1142, type: "STRING" }
    , FILEDEPENDSX: { code: 1143, type: "INT32" }
    , FILEDEPENDSN: { code: 1144, type: "INT32" }
    , DEPENDSDICT: { code: 1145, type: "INT32" }
    , SOURCEPKGID: { code: 1146, type: "BIN" }
    , FILECONTEXTS: { code: 1147, type: "STRING_ARRAY" } //FILE

    , HEADERIMMUTABLE { code: 63, type: "BIN" }
    , HEADERI18NTABLE { code: 100, type: "STRING_ARRAY" }

    , PREINSCRIPT: { code: 1023, type: "STRING" }
    , POSTINSCRIPT: { code: 1024, type: "STRING" }
    , PREUNSCRIPT: { code: 1025, type: "STRING" }
    , POSTUNSCRIPT: { code: 1026, type: "STRING" }
    , PREINPROG: { code: 1085, type: "STRING" }
    , POSTINPROG: { code: 1086, type: "STRING" }
    , PREUNPROG: { code: 1087, type: "STRING" }
    , POSTUNPROG: { code: 1088, type: "STRING" }

    , PRETRANSSCRIPT: { code: 1151, type: "STRING" }
    , POSTTRANSSCRIPT: { code: 1152, type: "STRING" }
    , PRETRANSPROG: { code: 1153, type: "STRING" }
    , POSTTRANSPROG: { code: 1154, type: "STRING" }

    , TRIGGERSCRIPTS: { code: 1065, type: "STRING_ARRAY" }
    , TRIGGERNAME: { code: 1066, type: "STRING_ARRAY" }
    , TRIGGERVERSION: { code: 1067, type: "STRING_ARRAY" }
    , TRIGGERFLAGS: { code: 1068, type: "INT32" }
    , TRIGGERINDEX: { code: 1069, type: "INT32" }
    , TRIGGERSCRIPTPROG: { code: 1092, type: "STRING_ARRAY" }

    , OLDFILENAMES: { code: 1027, type: "STRING_ARRAY" }
    , FILESIZES: { code: 1028, type: "INT32" } //FILE
    , FILEMODES: { code: 1030, type: "INT16" } //FILE
    , FILERDEVS: { code: 1033, type: "INT16" } //FILE
    , FILEMTIMES: { code: 1034, type: "INT32" } //FILE
    , FILEMD5S: { code: 1035, type: "STRING_ARRAY" } //FILE
    , FILELINKTOS: { code: 1036, type: "STRING_ARRAY" } //FILE
    , FILEFLAGS: { code: 1037, type: "INT32" } //FILE
    , FILEUSERNAME: { code: 1039, type: "STRING_ARRAY" } //FILE
    , FILEGROUPNAME: { code: 1040, type: "STRING_ARRAY" } //FILE
    , FILEDEVICES: { code: 1095, type: "INT32" } //FILE
    , FILEINODES: { code: 1096, type: "INT64" } //FILE
    , FILELANGS: { code: 1097, type: "STRING_ARRAY" } //FILE
    , PREFIXES: { code: 1098, type: "STRING_ARRAY" }
    , DIRINDEXES: { code: 1116, type: "INT32" } //FILE
    , BASENAMES: { code: 1117, type: "STRING_ARRAY" } //FILE
    , DIRNAMES: { code: 1118, type: "STRING_ARRAY" } //FILE

    , PROVIDENAME: { code: 1047, type: "STRING_ARRAY" }
    , REQUIREFLAGS: { code: 1048, type: "INT32" }
    , REQUIRENAME: { code: 1049, type: "STRING_ARRAY" }
    , REQUIREVERSION: { code: 1050, type: "STRING_ARRAY" }
    , CONFLICTFLAGS: { code: 1053, type: "INT32" }
    , CONFLICTNAME: { code: 1054, type: "STRING_ARRAY" }
    , CONFLICTVERSION: { code: 1055, type: "STRING_ARRAY" }
    , OBSOLETENAME: { code: 1090, type: "STRING_ARRAY" }
    , PROVIDEFLAGS: { code: 1112, type: "INT32" }
    , PROVIDEVERSION: { code: 1113, type: "STRING_ARRAY" }
    , OBSOLETEFLAGS: { code: 1114, type: "INT32" }
    , OBSOLETEVERSION: { code: 1115, type: "STRING_ARRAY" }
};