import React from 'react'
import PropTypes from 'prop-types'

import {
  WindEffect as Container,
  WindEffectRail,
  ZeroWindValue,
  WindEffectValue
} from './elements'

const WindEffect = ({ rawValue = 31, zeroWindValue = 79 }) => {
  return (
    <Container>
      <WindEffectRail effect={28} />
      <ZeroWindValue>{zeroWindValue}</ZeroWindValue>
      <WindEffectValue>{`+${rawValue}`}</WindEffectValue>
    </Container>
  )
}

WindEffect.propTypes = {
  rawValue: PropTypes.number,
  zeroWindValue: PropTypes.number
}

export default WindEffect
