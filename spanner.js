import { add, sub, startOf } from './arithmetic'

const isNumber = n => n >= '0' && n <= '9'
const isAlpha = n => n >= 'a' && n <= 'z' || n >= 'A' && n <= 'Z'
const isAlphanumeric = n => isNumber(n) || isAlpha(n)
const isOperation = n => n == '/' || n == '+' || n == '-' || n == '('
const isTimezone = n => isAlpha(n) || n == '_' || n == '/'

export default (anchor, s, tz, vars) => {
  let i = 0

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
    let value = readnumber()
    if (value == '') value = 1
    return [+value, readalpha()]
  }

  // could start with a timezone
  if (i < s.length && s[i] == '(') {
    i++
    tz = readtimezone()
    if (s[i] != ')') throw new Error('Expecting closing ) on timezone')
    i++
  }

  // could start with 'now' or another variable
  if (i < s.length && isAlpha(s[i])) {
    const variable = readalpha()
    if (variable != 'now') { // now is the default
      if (!vars || !vars[variable])
        throw new Error(`Variable ${variable} not known`)
      let f = vars[variable]
      if (typeof f == 'function') f = f(tz)
      anchor = f
    }
  }

  while (i < s.length && isOperation(s[i])) {
    if (s[i] == '/') {
      i++
      const unit = readalpha()
      if (!startOf[unit]) throw new Error(`Unknown unit ${unit}`)
      anchor = startOf[unit](anchor, tz)
    }
    else if (s[i] == '+') {
      i++
      while (i < s.length && isAlphanumeric(s[i])) {
        const [ n, unit ] = readduration()
        if (!add[unit]) throw new Error(`Unknown unit ${unit}`)
        anchor = add[unit](anchor, n, tz)
      }
    }
    else if (s[i] == '-') {
      i++
      while (i < s.length && isAlphanumeric(s[i])) {
        const [ n, unit ] = readduration()
        if (!sub[unit]) throw new Error(`Unknown unit ${unit}`)
        anchor = sub[unit](anchor, n, tz)
      }
    }
    else if (s[i] == '(') {
      i++
      tz = readtimezone()
      if (s[i] != ')') throw new Error('Expecting closing ) on timezone')
      i++
    }
  }

  if (i < s.length) throw new Error(`unknown format ${i} < ${s.length}`)

  return anchor
}