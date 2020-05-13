import { add, sub, diff } from './arithmetic'

export default (anchor, count, unit, tz) => {
  if (!diff[unit]) throw new Error(`Unknown unit ${unit}`)
  const res = {
    nth: n => n >= 0
      ? add[unit](anchor, count * n, tz)
      : sub[unit](anchor, -count * n, tz),
    floor: d => {
      const rel = -diff[unit](anchor, d) / count
      const actual = res.nth(rel)
      return actual.valueOf() > d.valueOf() ? rel - 1 : rel
    },
    ceil: d => {
      const rel = -diff[unit](anchor, d) / count
      const actual = res.nth(rel)
      return actual.valueOf() < d.valueOf() ? rel + 1 : rel
    },
    after: d => res.nth(res.ceil(d)),
    before: d => res.nth(res.floor(d)),
    between: (start, end) => {
      if (start.valueOf() > end.valueOf()) [start, end] = [end, start]
      const startindex = res.ceil(start)
      const endindex = res.floor(end)
      if (startindex > endindex) return []
      return Array(endindex - startindex + 1)
        .fill()
        .map((_, i) => startindex + i)
        .map(res.nth)
    }
  }
  return res
}
