const getTypeTag = obj => Object.prototype.toString.call(obj)

export const isBoolean = obj => getTypeTag(obj) === '[object Boolean]'

export const isNumber = obj => getTypeTag(obj) === '[object Number]'

export const isString = obj => getTypeTag(obj) === '[object String]'

export const isUndefined = obj => getTypeTag(obj) === '[object Undefined]'

export const isNull = obj => getTypeTag(obj) === '[object Null]'

export const isArray = obj => getTypeTag(obj) === '[object Array]'

export const isObject = obj => getTypeTag(obj) === '[object Object]'

export const isFunction = obj => getTypeTag(obj) === '[object Function]'

export const isDate = obj => getTypeTag(obj) === '[object Date]'

export const isRegExp = obj => getTypeTag(obj) === '[object RegExp]'
