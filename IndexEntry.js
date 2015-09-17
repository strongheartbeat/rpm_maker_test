// Header structure Header (Magic(0x 8EADE8 ), Version (0x 01), Reserv(4), NumOfIdxEntries(4), StoreSize(4)
// Index Entry (Tag, Type, Offset, Count)
// The Store

var types =
  { 0: "File"
  , "\0": "OldFile" // like 0
  , "": "OldFile"
  , 1: "Link"
  , 2: "SymbolicLink"
  , 3: "CharacterDevice"
  , 4: "BlockDevice"
  , 5: "Directory"
  , 6: "FIFO"
  , 7: "ContiguousFile" // like 0
  // posix headers
  , g: "GlobalExtendedHeader" // k=v for the rest of the archive
  , x: "ExtendedHeader" // k=v for the next file
  // vendor-specific stuff
  , A: "SolarisACL" // skip
  , D: "GNUDumpDir" // like 5, but with data, which should be skipped
  , I: "Inode" // metadata only, skip
  , K: "NextFileHasLongLinkpath" // data = link path of next file
  , L: "NextFileHasLongPath" // data = path of next file
  , M: "ContinuationFile" // skip
  , N: "OldGnuLongPath" // like L
  , S: "SparseFile" // skip
  , V: "TapeVolumeHeader" // skip
  , X: "OldExtendedHeader" // like x
  }

Object.keys(types).forEach(function (t) {
  types[types[t]] = types[types[t]] || t
})

var util = require('util');
console.log(util.inspect(types));