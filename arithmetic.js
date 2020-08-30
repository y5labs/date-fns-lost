import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import {
  addMilliseconds,
  subMilliseconds,
  setMilliseconds,
  differenceInMilliseconds,
  addSeconds,
  subSeconds,
  startOfSecond,
  differenceInSeconds,
  addMinutes,
  subMinutes,
  startOfMinute,
  differenceInMinutes,
  addHours,
  subHours,
  startOfHour,
  differenceInHours,
  addDays,
  subDays,
  startOfDay,
  differenceInDays,
  addWeeks,
  subWeeks,
  startOfWeek,
  startOfISOWeek,
  differenceInCalendarWeeks,
  differenceInCalendarISOWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  differenceInMonths,
  addYears,
  subYears,
  startOfYear,
  differenceInYears
} from 'date-fns'

const wrap = (d, tz, fn) => {
  d = utcToZonedTime(d, tz)
  d = fn(d)
  d = zonedTimeToUtc(d, tz)
  return d
}

const add = {
  ms: (d, n, tz) => wrap(d, tz, d => addMilliseconds(d, n)),
  s: (d, n, tz) => wrap(d, tz, d => addSeconds(d, n)),
  m: (d, n, tz) => wrap(d, tz, d => addMinutes(d, n)),
  h: (d, n, tz) => wrap(d, tz, d => addHours(d, n)),
  d: (d, n, tz) => wrap(d, tz, d => addDays(d, n)),
  w: (d, n, tz) => wrap(d, tz, d => addWeeks(d, n)),
  M: (d, n, tz) => wrap(d, tz, d => addMonths(d, n)),
  y: (d, n, tz) => wrap(d, tz, d => addYears(d, n))
}

const sub = {
  ms: (d, n, tz) => wrap(d, tz, d => subMilliseconds(d, n)),
  s: (d, n, tz) => wrap(d, tz, d => subSeconds(d, n)),
  m: (d, n, tz) => wrap(d, tz, d => subMinutes(d, n)),
  h: (d, n, tz) => wrap(d, tz, d => subHours(d, n)),
  d: (d, n, tz) => wrap(d, tz, d => subDays(d, n)),
  w: (d, n, tz) => wrap(d, tz, d => subWeeks(d, n)),
  M: (d, n, tz) => wrap(d, tz, d => subMonths(d, n)),
  y: (d, n, tz) => wrap(d, tz, d => subYears(d, n))
}

const startOf = {
  ms: (d, tz) => wrap(d, tz, d => setMilliseconds(d, 0)),
  s: (d, tz) => wrap(d, tz, d => startOfSecond(d)),
  m: (d, tz) => wrap(d, tz, d => startOfMinute(d)),
  h: (d, tz) => wrap(d, tz, d => startOfHour(d)),
  d: (d, tz) => wrap(d, tz, d => startOfDay(d)),
  w: (d, tz) => wrap(d, tz, d => startOfWeek(d)),
  isow: (d, tz) => wrap(d, tz, d => startOfISOWeek(d)),
  M: (d, tz) => wrap(d, tz, d => startOfMonth(d)),
  y: (d, tz) => wrap(d, tz, d => startOfYear(d))
}

const wrapBoth = (d1, d2, tz, fn) => {
  d1 = utcToZonedTime(d1, tz)
  d2 = utcToZonedTime(d2, tz)
  return fn(d1, d2)
}

const diff = {
  ms: (d1, d2, tz) =>
    wrapBoth(d1, d2, tz, (d1, d2) =>
      differenceInMilliseconds(d1, d2)),
  s: (d1, d2, tz) => wrapBoth(d1, d2, tz, (d1, d2) => differenceInSeconds(d1, d2)),
  m: (d1, d2, tz) => wrapBoth(d1, d2, tz, (d1, d2) => differenceInMinutes(d1, d2)),
  h: (d1, d2, tz) => wrapBoth(d1, d2, tz, (d1, d2) => differenceInHours(d1, d2)),
  d: (d1, d2, tz) => wrapBoth(d1, d2, tz, (d1, d2) => differenceInDays(d1, d2)),
  w: (d1, d2, tz) => wrapBoth(d1, d2, tz, (d1, d2) => differenceInCalendarWeeks(d1, d2)),
  isow: (d1, d2, tz) => wrapBoth(d1, d2, tz, (d1, d2) => differenceInCalendarISOWeeks(d1, d2)),
  M: (d1, d2, tz) => wrapBoth(d1, d2, tz, (d1, d2) => differenceInMonths(d1, d2)),
  y: (d1, d2, tz) => wrapBoth(d1, d2, tz, (d1, d2) => differenceInYears(d1, d2))
}

// todo: previous day of week, next day of week?

export { add, sub, startOf, diff }
