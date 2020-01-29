import React from 'react'

import {
  WindEffect as Container,
  WindEffectRail,
  ZeroWindValue,
  WindEffectValue
} from './elements'

const WindEffect = ({ rawValue, zeroWindValue }) => {
  return (
    <Container>
      <WindEffectRail effect={28} />
      <ZeroWindValue>79</ZeroWindValue>
      <WindEffectValue>+31</WindEffectValue>
    </Container>
  )
}

export default WindEffect
