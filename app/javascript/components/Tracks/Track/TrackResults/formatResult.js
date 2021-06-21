const taskUnits = {
  time: 'units.sec',
  distance: 'units.m',
  distance_in_altitude: 'units.m',
  distance_in_time: 'units.m',
  speed: 'units.kmh'
}

export const formatResult = (result, task, t) => {
  return `${result.toFixed(task === 'time' ? 1 : 0)} ${t(taskUnits[task])}`
}
