import React from 'react'
import PropTypes from 'prop-types'

import {
  WindEffect as Container,
  WindEffectRail,
  ZeroWindValue,
  WindEffectValue
} from './elements'

const windEffectPresentation = (value, presenter) => {
  if (value === 0) return 0
  if (value > 0) return `+${presenter(value)}`
  if (value < 0) return `-${presenter(Math.abs(value))}`
}

const WindEffect = ({ rawValue, zeroWindValue, valuePresenter = val => val }) => {
  const windEffect = rawValue - zeroWindValue
  const windEffectPercent =
    100 - (Math.min(rawValue, zeroWindValue) / Math.max(rawValue, zeroWindValue)) * 100

  return (
    <Container>
      <WindEffectRail effect={windEffectPercent} />
      <ZeroWindValue aria-label="wind cancelled value">
        {valuePresenter(zeroWindValue)}
      </ZeroWindValue>
      <WindEffectValue aria-label="wind effect">
        {windEffectPresentation(windEffect, valuePresenter)}
      </WindEffectValue>
    </Container>
  )
}

WindEffect.propTypes = {
  rawValue: PropTypes.number,
  zeroWindValue: PropTypes.number,
  valuePresenter: PropTypes.func
}

export default WindEffect
