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

export const formatResult = (result: number, task: Task) => {
  return `${result.toFixed(task === 'time' ? 1 : 0)} ${I18n.t(taskUnits[task])}`
}
