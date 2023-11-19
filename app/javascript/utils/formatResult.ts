import { I18n } from 'components/TranslationsProvider'
import { Task } from 'api/tracks/results'

const taskUnits = {
  distance: 'units.m',
  speed: 'units.kmh',
  time: 'units.sec',
  vertical_speed: 'units.kmh',
  distance_in_time: 'units.m',
  distance_in_altitude: 'units.m',
  flare: 'units.m',
  base_race: 'units.sec'
}

type Options = {
  showUnits?: boolean
}

const formatResult = (result: number, task: Task, options: Options = {}) => {
  const units = I18n.t(taskUnits[task])
  return [
    result.toFixed(['time', 'flare'].includes(task) ? 1 : 0),
    options.showUnits ? units : ''
  ]
    .filter(Boolean)
    .join(' ')
}

export default formatResult
