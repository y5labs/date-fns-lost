# date-fns-lost
Lost tools for date-fns including domain specific language for time manipulations and schedule operations.

```javascript
import locale from 'date-fns/locale/en-GB'
import { dsl, schedule } from 'date-fns-lost'
import { format, utcToZonedTime } from 'date-fns-tz'

const fmt = (d, timeZone) =>
  format(
    utcToZonedTime(d, timeZone),
    'yyyy-MM-dd HH:mm:ss (zzzz)',
    { timeZone, locale })

const parsed = dsl(`

  start: now/M
  end: now+4M/M

  // the first week of every month
  result:
  + interval(now/M, +7d, 1M)

`,
'America/New_York')

const segments = schedule(
  parsed.schedules,
  parsed.schedules.result,
  {
    start: parsed.constants.start,
    end: parsed.constants.end
  },
  'America/New_York')
for (let segment of segments) {
  console.log(`${fmt(segment.start, 'America/New_York')} — ${fmt(segment.end, 'America/New_York')}`)
}
```