import React from 'react'

import { SpeedScaleContainer } from './elements'

const scaleItems = ['< 130', '130 - 160', '160 - 190', '190 - 220', '220 - 250', '> 250']

const SpeedScale = () => {
  return (
    <SpeedScaleContainer>
      {scaleItems.map(item => (
        <div key={item}>
          {item} {I18n.t('units.kmh')}
        </div>
      ))}
    </SpeedScaleContainer>
  )
}

export default SpeedScale
