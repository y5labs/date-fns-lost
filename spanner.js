const isNumber = n => n >= '0' && n <= '9'
const isAlpha = n => n >= 'a' && n <= 'z' || n >= 'A' && n <= 'Z'
const isAlphanumeric = n => isNumber(n) || isAlpha(n)
const isDef = n => isNumber(n) || isAlpha(n) || n == '_'
const isOperation = n => n == '/' || n == '+' || n == '-' || n == '('
const isTimezone = n => isAlpha(n) || n == '_' || n == '/'
const isWhitespace = n => n == ' ' || n == '\t' || n == '\n'

export default (anchor, s, tz, vars) => {
  let i = 0

  const readwhitespace = () => {
    while (i < s.length && isWhitespace(s[i])) i++
  }

  const readdef = () => {
    let n = 0
    while (i + n < s.length && isDef(s[i+n])) n++
    const res = s.substr(i, n)
    i += n
    return res
  }

  const readalpha = () => {
    let n = 0
    while (i + n < s.length && isAlpha(s[i+n])) n++
    const res = s.substr(i, n)
    i += n
    return res
  }

  const readnumber = () => {
    let n = 0
    while (i + n < s.length && isNumber(s[i+n])) n++
    const res = s.substr(i, n)
    i += n
    return res
  }

  const readtimezone = () => {
    let n = 0
    while (i + n < s.length && isTimezone(s[i+n])) n++
    const res = s.substr(i, n)
    i += n
    return res
  }

  const readduration = () => {
    readwhitespace()
    let value = readnumber()
    if (value == '') value = 1
    readwhitespace()
    const unit = readalpha()
    readwhitespace()
    return [+value, unit]
  }

  readwhitespace()

  // could start with a timezone
  if (i < s.length && s[i] == '(') {
    i++
    tz = readtimezone()
    if (s[i] != ')') throw new Error('Expecting closing ) on timezone')
    i++
  }

  readwhitespace()

  // could start with 'now' or another variable
  if (i < s.length && isAlpha(s[i])) {
    const variable = readdef()
    if (variable != 'now') { // now is the default
      if (!vars || !vars[variable])
        throw new Error(`Variable ${variable} not known`)
      let f = vars[variable]
      if (typeof f == 'function') f = f(tz)
      anchor = f
    }
  }
  else if (i < s.length && isNumber(s[i])) {
    while (i < s.length && isAlphanumeric(s[i]))
      anchor = anchor.add.apply(anchor, readduration())
  }

  readwhitespace()

  anchor = anchor.clone()
  if (tz) anchor = anchor.tz(tz)

  while (i < s.length && isOperation(s[i])) {
    if (s[i] == '/') {
      i++
      anchor = anchor.startOf(readalpha())
    }
    else if (s[i] == '+') {
      i++
      while (i < s.length && isAlphanumeric(s[i]))
        anchor = anchor.add.apply(anchor, readduration())
    }
    else if (s[i] == '-') {
      i++
      while (i < s.length && isAlphanumeric(s[i]))
        anchor = anchor.subtract.apply(anchor, readduration())
    }
    else if (s[i] == '(') {
      i++
      tz = readtimezone()
      anchor = anchor.tz(tz)
      if (s[i] != ')') throw new Error('Expecting closing ) on timezone')
      i++
    }

    readwhitespace()
  }

  if (i < s.length) throw new Error(`unknown format ${i} < ${s.length}`)

  return anchor
}