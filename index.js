import iso8601 from './iso8601.js'
import dsl from './dsl.js'
import spanner from './spanner.js'
import schedule from './schedule.js'
import chrono from './chrono.js'

export default moment => ({
  iso8601,
  dsl: dsl(moment),
  chrono,
  spanner,
  schedule: schedule(moment),
})