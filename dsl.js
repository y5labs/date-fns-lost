import { parseISO, isValid } from 'date-fns'
import spanner from './spanner'

const isNumber = (n) => n >= '0' && n <= '9'
const isAlpha = (n) => n >= 'a' && n <= 'z' || n >= 'A' && n <= 'Z'
const isAlphanumeric = (n) => isNumber(n) || isAlpha(n)
const isDef = (n) => isAlphanumeric(n) || n == '_'
const isOperation = (n) => n == '+' || n == '-' || n == '*'
const isEmpty = (n) => n == ' ' || n == '\t' || n == '\n'
const isSpannerOperation = (n) => n == '/' || n == '+' || n == '-' || n == '('
const isSpannerChar = (n) => isAlphanumeric(n) || ['_', '+', '-', '(', ')', '/'].indexOf(n) != -1

export default (s, tz, inschedules, inconstants) => {
  const outconstants = { now: new Date() }
  const outschedules = {}
  let i = 0

  const printContext = () => {
    let back = 0
    while (back < 10 && i - back - 1 >= 0 && s[i - back - 1] != '\n')
      back++
    let forward = 0
    while (back < 10 && i + forward < s.length && s[i + forward] != '\n')
      forward++
    const context = s.substring(i - back, i + forward)
    let position = ''
    for (let x = 1; x < back; x++) position += ' '
    position += '^'
    console.log(context)
    console.log(position)
  }

  const emitError = (msg) => {
    printContext()
    throw new Error(msg)
  }

  const forward = () => {
    while (i < s.length && isEmpty(s[i])) i++
    if (i + 1 < s.length && s[i] == '/' && s[i + 1] == '/')
      while (i < s.length && s[i] != '\n') i++
    if (i < s.length && isEmpty(s[i])) forward()
  }

  const readdef = () => {
    if (i < s.length && !isAlpha(s[i]))
      emitError(`Expecting definition, not ${s[i]}`)
    let n = 0
    while (i + n < s.length && isDef(s[i+n])) n++
    const res = s.substring(i, i + n)
    i += n
    return res
  }

  // 2018-07-01T00:00:00Z
  const readISO8601 = () => {
    if (i + 20 >= s.length) emitError('Incomplete date')
    const dateString = s.substr(i, i + 20)
    const date = parseISO(dateString)
    if (!isValid(date)) emitError(`'${dateString}'' is not a valid date`)
    i += 20
    return date
  }

  const readSpannerContent = () => {
    let n = 0
    let brackets = 0
    while (i < s.length && isSpannerChar(s[i + n])) {
      if (s[i + n] == '(') brackets++
      else if (s[i + n] == ')') {
        if (brackets == 0) break
        brackets--
      }
      n++
    }
    const adjustment = s.substring(i, i + n)
    i += n
    return adjustment
  }

  const readSpanner = (anchor) => {
    const adjustment = readSpannerContent()
    return spanner(anchor, adjustment, tz, Object.assign({}, inconstants, outconstants))
  }

  const readCountAndUnit = () => {
    let n = 0
    while (i < s.length && isNumber(s[i + n])) n++
    if (i < s.length && s[i + n] == '.') {
      n++
      while (i < s.length && isNumber(s[i + n])) n++
    }
    const count = parseFloat(s.substring(i, i + n))
    i += n
    if (i >= s.length) emitError('Expecting unit')
    n = 0
    while (i < s.length && isAlpha(s[i + n])) n++
    const unit = s.substring(i, i + n)
    i += n
    return {
      count: count,
      unit: unit
    }
  }

  const readInterval = () => {
    i++
    forward()
    if (i >= s.length) emitError('Expecting interval params')
    const start = readSpannerContent()
    forward()
    if (i + 1 >= s.length || s[i] != ',')
      emitError('Expecting interval params')
    i++
    forward()
    if (i >= s.length) emitError('Expecting interval params')
    const duration = readSpannerContent()
    forward()
    if (i + 1 >= s.length || s[i] != ',')
      emitError('Expecting interval params')
    i++
    forward()
    if (i >= s.length) emitError('Expecting interval params')
    const adjustment = readCountAndUnit()
    forward()
    if (i >= s.length || s[i] != ')')
      emitError('Expecting interval close bracket')
    i++
    return {
      type: 'interval',
      start: start,
      count: adjustment.count,
      unit: adjustment.unit,
      duration: duration
    }
  }

  const readRange = () => {
    i++
    forward()
    if (i >= s.length) emitError('Expecting range params')
    const start = readSpannerContent()
    forward()
    if (i + 1 >= s.length || s[i] != ',')
      emitError('Expecting range params')
    i++
    forward()
    if (i >= s.length) emitError('Expecting range params')
    const end = readSpannerContent()
    forward()
    if (i >= s.length || s[i] != ')')
      emitError('Expecting range close bracket')
    i++
    return {
      type: 'rang',
      start: start,
      end: end
    }
  }

  const readReference = () => {
    const id = readdef()
    if (outschedules[id]) return outschedules[id]
    else if (inschedules[id]) return inschedules[id]
    else emitError(`Schedule ${id} not found`)
  }

  const readSchedule = (def) => {
    let res = null
    const operation = s[i]
    i++
    forward()
    if (i >= s.length) emitError('Expecting schedule terms')
    const id = readdef()
    forward()
    if (i < s.length && s[i] == '(') {
      if (id == 'interval') res = readInterval()
      else if (id == 'range') res = readRange()
      else emitError(`Unknown function ${id}`)
    } else res = {
      type: 'schedule',
      schedule: id
    }
    res.operation = operation == '+'
      ? 'or'
      : operation == '-'
      ? 'not'
      : operation == '*'
      ? 'and'
      : null
    return res
  }

  const readConstant = () => {
    let anchor = null
    if (isNumber(s[i])){
      anchor = readISO8601()
    } else {
      const id = readdef()
      if (outconstants[id]) anchor = outconstants[id]
      else if (inconstants[id]) anchor = inconstants[id]
      else emitError(`Constant ${id} not found`)
    }
    if (i < s.length && isSpannerOperation(s[i])) return readSpanner(anchor)
    return anchor
  }

  while (i < s.length) {
    forward()
    const def = readdef()
    forward()
    if (def == '' && i >= s.length) break
    if (i >= s.length) emitError('Expecting : after definition')
    if (i < s.length && s[i] != ':')
      emitError('Expecting : after definition')
    i++
    forward()
    if (i >= s.length) emitError('Expecting definition terms')
    if (isOperation(s[i])) {
      const schedule = []
      while (i < s.length && isOperation(s[i])) {
        schedule.push(readSchedule(def))
        forward()
      }
      outschedules[def] = schedule
    }
    else outconstants[def] = readConstant()
  }

  return {
    schedules: outschedules,
    constants: outconstants
  }
}