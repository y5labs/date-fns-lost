import {
  rangeOverlaps,
  rangeAdd,
  rangeSubtract,
  rangeIntersect
} from './range'
import chrono from './chrono'
import spanner from './spanner'
import { parseISO } from 'date-fns'

const cliprange = (range, clip) => {
  if (rangeOverlaps(range, clip))
    return rangeIntersect(range, clip)
  return []
}

const components = {
  range: (schedules, def, clip, tz) =>
    cliprange({ start: parseISO(def.start), end: parseISO(def.end) }, clip),
  interval: (schedules, def, clip, tz) => {
    let result = []
    const interval = chrono(
      spanner(new Date(), def.start, tz),
      def.count, def.unit, tz)
      .between(clip.start, clip.end)
    for (let start of interval)
      result.push(
        ...cliprange({ start, end: spanner(start, def.duration, tz) }, clip))
    return result
  },
  schedule: (schedules, def, clip, tz) =>
    schedule(schedules, schedules[def.schedule], clip, tz)
}

const operations = {
  or: (a, b, tz) => {
    let result = []
    let aindex = 0
    let bindex = 0
    while (aindex < a.length && bindex < b.length) {
      if (rangeOverlaps(a[aindex], b[bindex])) {
        result.push(...rangeAdd(a[aindex], b[bindex]))
        aindex++
        bindex++
        continue
      }
      if (a[aindex].start < b[bindex].start) {
        result.push(a[aindex])
        aindex++
        continue
      }
      if (a[aindex].start > b[bindex].start) {
        result.push(b[bindex])
        bindex++
        continue
      }
    }
    for (let i = aindex; i < a.length; i++)
      result.push(a[i])
    for (let i = bindex; i < b.length; i++)
      result.push(b[i])
    return result
  },
  and: (a, b, tz) => {
    let result = []
    let aindex = 0
    let bindex = 0
    while (aindex < a.length && bindex < b.length) {
      if (rangeOverlaps(a[aindex], b[bindex])) {
        result.push(...rangeIntersect(a[aindex], b[bindex]))
        aindex++
        bindex++
        continue
      }
      if (a[aindex].start < b[bindex].start) {
        aindex++
        continue
      }
      if (a[aindex].start > b[bindex].start) {
        bindex++
        continue
      }
    }
    return result
  },
  not: (a, b, tz) => {
    let result = []
    const process = a.slice(0)
    let bindex = 0
    while (process.length > 0 && bindex < b.length) {
      if (rangeOverlaps(process[0], b[bindex])) {
        const pieces = rangeSubtract(process[0], b[bindex])
        process.shift()
        if (pieces.length > 0)
          result.push(pieces[0])
        if (pieces.length > 1)
          process.unshift(pieces[1])
        continue
      }
      if (process[0].start < b[bindex].start) {
        result.push(process[0])
        process.shift()
        continue
      }
      if (process[0].start > b[bindex].start) {
        bindex++
        continue
      }
    }
    for (let i = 0; i < process.length; i++)
      result.push(process[i])
    return result
  }
}

const schedule = (schedules, defs, clip, tz) => {
  let result = []
  for (let def of defs) {
    const pieces = components[def.type](schedules, def, clip, tz)
    result = operations[def.operation](result, pieces, tz)
  }
  return result
}

export default schedule
