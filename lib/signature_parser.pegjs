
{
    var sig = require('./signature');
}

signature =
    type *

type =
    basic
  / struct
  / array
  / dict_entry

struct =
    '(' members:type + ')' { return sig.createStruct(members); }

array =
    'a' el_type:type { return sig.createArray(el_type); }

dict_entry =
    '{' key:type value:type '}' { return sig.createDictEntry(key, value) }

variant =
    'v' t:type { return sig.createVariant(t) }

basic = 
    code:[ybnqiuxtdsogh] { return sig.createBasic(code); }

