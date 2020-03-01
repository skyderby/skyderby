const taskUnits = {
  time: I18n.t('units.sec'),
  distance: I18n.t('units.m'),
  distance_in_altitude: I18n.t('units.m'),
  distance_in_time: I18n.t('units.m'),
  speed: I18n.t('units.kmh')
}

export const formatResult = (result, task) =>
  `${result.toFixed(task === 'time' ? 1 : 0)} ${taskUnits[task]}`
