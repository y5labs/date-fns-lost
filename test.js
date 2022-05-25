import momentRange from 'moment-range'
import momentTz from 'moment-timezone'
const moment = momentRange.extendMoment(momentTz)
import lost from './'
const {
  chrono,
  spanner,
  schedule,
  dsl,
  iso8601
} = lost(moment)

// const content = `
//   //
//   // A date constant is either an iso8601 string or a reference
//   // to another constant. Constants can optionally be followed
//   // immediately by spanner operations.
//   //
//   // day_in_june: 2018-06-15T10:00:00Z
//   // start_of_june: day_in_june/M
//   //
//   //
//   // An interval is a repeating pattern and can be specified as:
//   //
//   // interval(anchor, duration, repeat)
//   //
//   // Where:
//   //   anchor   - A reference to a constant optionally followed
//   //              by spanner operations.
//   //   duration - A spanner operation to calculate the duration
//   //              of each iteration.
//   //   repeat   - A number followed by the name or short code
//   //              of a unit to jump forward and backwards from
//   //              anchor to create the pattern.
//   //
//   //
//   // A range is all time between a start and an end
//   //
//   // range(start, end)
//   //
//   // Where:
//   //   start    - A reference to a constant optionally followed
//   //              by spanner operations. Inclusive in the range.
//   //   end      - A reference to a constant optionally followed
//   //              by spanner operations. Inclusive in the range.
//   //
//   //
//   // Both interval and range cannot accept iso8601 parameters,
//   // these can be defined as constants and referenced.
//   //
//   //
//   // Spanner operations are executed sequentially against a
//   // constant or if not supplied will default to the current time.
//   //
//   // (timezone) - Changes all following operations to be
//   //              executed in the supplied timezone.
//   //              http://momentjs.com/timezone/
//   // +5days     - Add or substract a multiple of a time unit.
//   // +5d4h      - Can use short codes and multiple units.
//   // /M         - Jump to the start of time unit.
//   //

//   start: now/M
//   end: now+4M/M

//   result:
//   + interval(now/M, +7d, 1M)
//   * interval(/isoWeek+1d, +1d, 1w)

// `
// const parsed = dsl.parse(content)
// console.log(parsed.schedules)
// const clip = moment.range(parsed.constants.start, parsed.constants.end)
// const segments = schedule.between(parsed.schedules, parsed.schedules.result, clip)
// for (let segment of segments)
  // console.log(segment.start.format(iso8601), '—', segment.end.format(iso8601))