import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { SummaryItem, Title, ValueContainer, Value, Units } from './elements'

const valuePresentation = value => {
  if (!Number.isFinite(value)) return '--.-'

  return value.toFixed(1)
}

const Time = ({ value }) => {
  const { t } = useI18n()

  return (
    <SummaryItem value="time">
      <Title>{t('tracks.indicators.duration')}</Title>
      <ValueContainer>
        <Value aria-label="duration">{valuePresentation(value)}</Value>
        <Units>{t('units.sec')}</Units>
      </ValueContainer>
    </SummaryItem>
  )
}

Time.propTypes = {
  value: PropTypes.number
}

export default Time
