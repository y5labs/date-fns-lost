export default (anchor, count, unit) => {
  const res = {
    nth: n => anchor.clone().add(count * n, unit),
    count: d => d.diff(anchor, unit, true) / count,
    after: d => res.nth(Math.ceil(d.diff(anchor, unit, true) / count)),
    before: d => res.nth(Math.floor(d.diff(anchor, unit, true) / count)),
    next: d => {
      const current = res.count(d)
      let next = Math.ceil(current)
      if (next === current) next++
      return next
    },
    prev: d => {
      const current = res.count(d)
      let prev = Math.floor(current)
      if (prev === current) prev--
      return prev
    },
    between: (start, end) => {
      if (start.isAfter(end)) [start, end] = [end, start]
      const startindex = Math.ceil(res.count(start))
      const endindex = res.prev(end)
      if (startindex > endindex) return []
      const results = []
      for (let i = startindex; i <= endindex; i++) results.push(i)
      return results.map(res.nth)
    },
    clone: () => module.exports(anchor.clone(), count, unit),
    forward: n => anchor.add(count * n, unit),
    backward: n => anchor.subtract(count * n, unit)
  }
  return res
}