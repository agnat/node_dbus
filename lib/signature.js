
var TYPE_BYTE    = 'y'.charCodeAt(0)
  , TYPE_BOOLEAN = 'b'.charCodeAt(0)
  , TYPE_INT16 = 'n'.charCodeAt(0)
  , TYPE_UINT16 = 'q'.charCodeAt(0)
  , TYPE_INT32 = 'i'.charCodeAt(0)
  , TYPE_UINT32 = 'u'.charCodeAt(0)
  , TYPE_INT64 = 'x'.charCodeAt(0)
  , TYPE_UINT64 = 't'.charCodeAt(0)
  , TYPE_DOUBLE = 'd'.charCodeAt(0)
  , TYPE_STRING = 's'.charCodeAt(0)
  , TYPE_OBJECT_PATH = 'o'.charCodeAt(0)
  , TYPE_SIGNATURE = 'g'.charCodeAt(0)
  , TYPE_ARRAY = 'a'.charCodeAt(0)
  , TYPE_STRUCT = 'r'.charCodeAt(0)
  , TYPE_VARIANT = 'v'.charCodeAt(0)
  , TYPE_DICT_ENTRY = 'e'.charCodeAt(0)
  , TYPE_UNIX_FD = 'h'.charCodeAt(0)
;

exports.Basic = function Basic(code) {
  this.code = code.charCodeAt(0);
}

exports.Basic.prototype.padding = function(pos, v) {
  return pos % this.size(v);
}

exports.Basic.prototype.paddedSize = function(pos, v) {
  if (this.isFixedSize()) {
    return this.size(v) + this.padding(pos, v);
  } else {
    throw new Error("Kaputt");
  }
}

exports.Basic.prototype.size = function(v) {
  switch (this.code) {
    case TYPE_BYTE:
      return 1;

    case TYPE_INT16:
    case TYPE_UINT16:
      return 2;

    case TYPE_INT32:
    case TYPE_UINT32:
    case TYPE_BOOLEAN:
    case TYPE_UNIX_FD:
      return 4;

    case TYPE_INT64:
    case TYPE_UINT64:
    case TYPE_DOUBLE:
      return 8;

    case TYPE_STRING:
    case TYPE_SIGNATURE:
    case TYPE_OBJECT_PATH:
      return v.length;
    default:
      throw new Error("Unhandled type " + this.code);
  }
}

exports.Basic.prototype.isFixedSize = function() {
  switch (this.code) {
    case TYPE_BYTE:
    case TYPE_INT16:
    case TYPE_UINT16:
    case TYPE_INT32:
    case TYPE_UINT32:
    case TYPE_BOOLEAN:
    case TYPE_UNIX_FD:
    case TYPE_INT64:
    case TYPE_UINT64:
    case TYPE_DOUBLE:
      return true;

    case TYPE_STRING:
    case TYPE_SIGNATURE:
    case TYPE_OBJECT_PATH:
      return false;
    default:
      throw new Error("Unhandled type " + this.code);
  }
}

exports.Basic.prototype.size = function(v) {
  switch (this.code) {
    case TYPE_BYTE:
      return 1;

    case TYPE_INT16:
    case TYPE_UINT16:
      return 2;

    case TYPE_INT32:
    case TYPE_UINT32:
    case TYPE_BOOLEAN:
    case TYPE_UNIX_FD:
      return 4;

    case TYPE_INT64:
    case TYPE_UINT64:
    case TYPE_DOUBLE:
      return 8;

    case TYPE_STRING:
    case TYPE_SIGNATURE:
    case TYPE_OBJECT_PATH:
      return v.length;
  }
}

exports.Struct = function Struct(members) {
  this.members = members;
}

exports.Array_ = function Array_(type) {
  this.element_type = type;
}

var byte_count = new exports.Basic('u');

exports.Array_.prototype.paddedSize = function(pos, v) {
  var size = byte_count.paddedSize(pos, 0);
  pos += size;

  if (this.element_type.isFixedSize()) {
    size += this.element_type.padding(pos, v[0]);
    size += v.length * this.element_type.size(v[0]);
  } else {
    size += this.element_type.padding(pos, v[0]);
    for (var i = 0; i < v.length; ++i) {
      size += this.element_type.size(v[i]);
    }
  
  }
  return size;
}

exports.DictEntry = function DictEntry(key_type, value_type) {
  this.key_type = key_type;
  this.value_type = value_type;
}

exports.Variant = function(type) {
  this.type = type;
}

exports.createBasic  = function(code) { return new exports.Basic(code) }
exports.createStruct = function(code) { return new exports.Struct(code) }
exports.createArray  = function(code) { return new exports.Array_(code) }
exports.createDictEntry  = function(k,v) { return new exports.DictEntry(k,v) }
exports.createVariant  = function(type) { return new exports.Variant(type) }
