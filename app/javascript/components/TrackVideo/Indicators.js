import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import I18n from 'i18n-js'

import { msToKmh } from 'utils/unitsConversion'
import { IndicatorsContainer, ValueContainer, Value, Title } from './elements'

const altitudePlaceholder = '----'
const speedPlaceholder = '---'
const glideRatioPlaceholder = '-.--'

const Indicators = forwardRef((_props, ref) => {
  const altitudeRef = useRef()
  const hSpeedRef = useRef()
  const vSpeedRef = useRef()
  const glideRatioRef = useRef()

  const setBlankValues = () => {
    altitudeRef.current.innerText = altitudePlaceholder
    vSpeedRef.current.innerText = speedPlaceholder
    hSpeedRef.current.innerText = speedPlaceholder
    glideRatioRef.current.innerText = glideRatioPlaceholder
  }

  const setValues = ({ altitude, vSpeed, hSpeed, glideRatio }) => {
    altitudeRef.current.innerText = altitude.toFixed()
    vSpeedRef.current.innerText = msToKmh(vSpeed).toFixed()
    hSpeedRef.current.innerText = msToKmh(hSpeed).toFixed()
    glideRatioRef.current.innerText = glideRatio.toFixed(2)
  }

  useImperativeHandle(ref, () => ({
    setData: data => {
      if (data) {
        setValues(data)
      } else {
        setBlankValues()
      }
    }
  }))

  return (
    <IndicatorsContainer>
      <ValueContainer>
        <Value ref={altitudeRef}>{altitudePlaceholder}</Value>
        <Title>{I18n.t('tracks.indicators.altitude')}</Title>
      </ValueContainer>
      <ValueContainer>
        <Value ref={hSpeedRef}>{speedPlaceholder}</Value>
        <Title>{I18n.t('tracks.indicators.vertical_speed')}</Title>
      </ValueContainer>
      <ValueContainer>
        <Value ref={vSpeedRef}>{speedPlaceholder}</Value>
        <Title>{I18n.t('tracks.indicators.ground_speed')}</Title>
      </ValueContainer>
      <ValueContainer>
        <Value ref={glideRatioRef}>{glideRatioPlaceholder}</Value>
        <Title>{I18n.t('tracks.indicators.glide_ratio')}</Title>
      </ValueContainer>
    </IndicatorsContainer>
  )
})

Indicators.displayName = 'Indicators'

export default Indicators
