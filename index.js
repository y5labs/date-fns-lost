import iso8601 from './iso8601'
import dsl from './dsl'
import spanner from './spanner'
import schedule from './schedule'
import chrono from './chrono'

export default moment => ({
  iso8601,
  dsl: dsl(moment),
  chrono,
  spanner,
  schedule: schedule(moment),
})