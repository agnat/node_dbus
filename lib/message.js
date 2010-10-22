var Buffer = require('buffer').Buffer;

var MAJOR_PROTOCOL_VERSION = 1;

var MESSAGE_TYPE_INVALID       = 0
  , MESSAGE_TYPE_METHOD_CALL   = 1
  , MESSAGE_TYPE_METHOD_RETURN = 2
  , MESSAGE_TYPE_ERROR         = 3
  , MESSAGE_TYPE_SIGNAL        = 4
  ;

var MESSAGE_FLAG_NO_REPLY_EXPECTED = 0x1
  , MESSAGE_FLAG_NO_AUTO_START     = 0x2
  ;

var HEADER_FIELD_INVALID      = 0
  , HEADER_FIELD_PATH         = 1
  , HEADER_FIELD_INTERFACE    = 2
  , HEADER_FIELD_MEMBER       = 3
  , HEADER_FIELD_ERROR_NAME   = 4
  , HEADER_FIELD_REPLY_SERIAL = 5
  , HEADER_FIELD_DESTINATION  = 6
  , HEADER_FIELD_SENDER       = 7
  , HEADER_FIELD_SIGNATURE    = 8
  , HEADER_FIELD_UNIX_FDS     = 9
  ;

var TYPE_INVALID     = 0     // NUL
  , TYPE_BYTE        = 121   // y
  , TYPE_BOOLEAN     = 98    // b
  , TYPE_INT16       = 110   // n
  , TYPE_UINT16      = 113   // q
  , TYPE_INT32       = 105   // i
  , TYPE_UINT32      = 117   // u
  , TYPE_INT64       = 120   // x
  , TYPE_UINT64      = 116   // t
  , TYPE_DOUBLE      = 100   // d
  , TYPE_STRING      = 115   // s
  , TYPE_OBJECT_PATH = 111   // o
  , TYPE_SIGNATURE   = 103   // g
  , TYPE_ARRAY       = 97    // a
  , TYPE_STRUCT      = 114   // r ()
  , TYPE_VARIANT     = 118   // v
  , TYPE_DICT_ENTRY  = 101   // e {}
  , TYPE_UNIX_FD     = 104   // h
  ;

function Message(type) {
  var self = this;
  self.type = type;
  self.flags = 0;
}

Message.prototype.marshal = function() {
  var message_size = this._computeMessageSize();
  var buffer = new Buffer(message_size);
  this._writeHeader(buffer);
}

Message.prototype._computeMessageSize = function() {
  return 100; // XXX
}

Message.prototype._writeHeader = function(buffer) {
  buffer[0] = true ? 'I' : 'B'; // TODO endian test
  buffer[1] = this.type;
  buffer[2] = this.flags;
  buffer[3] = MAJOR_PROTOCOL_VERSION;
}

createMethodCall = function() {
  return new Message(MESSAGE_TYPE_METHOD_CALL);
}

createMethodReturn = function() {
  return new Message(MESSAGE_TYPE_METHOD_RETURN);
}

createError = function() {
  return new Message(MESSAGE_TYPE_ERROR);
}

createSignal = function() {
  return new Message(MESSAGE_TYPE_SIGNAL);
}

exports.Message          = Message;
exports.createMethodCall = createMethodCall;
exports.createMethodReturn = createMethodReturn;
exports.createError = createError;
exports.createSignal = createSignal;

