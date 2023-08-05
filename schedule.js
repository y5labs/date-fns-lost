import chrono from './chrono.js'
import spanner from './spanner.js'
import iso8601 from './iso8601.js'

const cliprange = (range, clip) => {
  if (range.overlaps(clip))
    return [range.intersect(clip)]
  return []
}

const operations = {
  or: (a, b) => {
    const result = []
    let aindex = 0
    let bindex = 0
    while (aindex < a.length && bindex < b.length) {
      if (a[aindex].overlaps(b[bindex], { adjacent: true })) {
        result.push(a[aindex].add(b[bindex], { adjacent: true }))
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
  and: (a, b) => {
    const result = []
    let aindex = 0
    let bindex = 0
    while (aindex < a.length && bindex < b.length) {
      if (a[aindex].overlaps(b[bindex])) {
        result.push(a[aindex].intersect(b[bindex]))
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
  not: (a, b) => {
    const result = []
    const process = a.slice(0)
    let bindex = 0
    while (process.length > 0 && bindex < b.length) {
      if (process[0].overlaps(b[bindex])) {
        const pieces = process[0].subtract(b[bindex])
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

export default moment => {
  const components = {
    range: (schedules, definition, clip) => {
      const range = moment.range(
        moment.utc(definition.start, iso8601),
        moment.utc(definition.end, iso8601)
      )
      return cliprange(range, clip)
    },
    interval: (schedules, definition, clip) => {
      let result = []
      const interval = chrono(
        spanner(moment.utc(), definition.start),
        definition.count, definition.unit)
        .between(
          clip.start.clone().subtract(definition.count, definition.unit),
          clip.end.clone().add(definition.count, definition.unit))
      for (const start of interval)
        result = result.concat(cliprange(
          moment.range(
            start,
            spanner(start.clone(), definition.duration)
          ),
          clip))
      return result
    },
    schedule: (schedules, definition, clip) => {
      return between(schedules, schedules[definition.schedule], clip)
    }
  }

  const between = (schedules, definitions, clip) => {
    let result = []
    for (let definition of definitions) {
      const pieces = components[definition.type](schedules, definition, clip)
      result = operations[definition.operation](result, pieces)
    }
    return result
  }

  return { between }
}