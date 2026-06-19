import I18n from 'i18n'

const KMH_TO_MPH = 0.621371
const M_TO_FT = 3.280839895

export const convertSpeed = (kmh, units = 'metric') =>
  units === 'imperial' ? kmh * KMH_TO_MPH : kmh

export const convertLength = (meters, units = 'metric') =>
  units === 'imperial' ? meters * M_TO_FT : meters

export const speedUnitLabel = (units = 'metric') =>
  I18n.t(units === 'imperial' ? 'units.mph' : 'units.kmh')

export const lengthUnitLabel = (units = 'metric') =>
  I18n.t(units === 'imperial' ? 'units.ft' : 'units.m')
