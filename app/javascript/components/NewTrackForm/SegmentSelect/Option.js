import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'

const Option = ({
  data: {
    segment: { name, pointsCount, hUp, hDown }
  },
  ...props
}) => {
  const { t } = useI18n()
  return (
    <components.Option {...props}>
      <div>{name}</div>
      <div>
        {t('tracks.choose.pt_cnt')}: {pointsCount}; {t('tracks.choose.elev')}: {hUp}↑{' '}
        {hDown}↓ {t('units.m')}
      </div>
    </components.Option>
  )
}

Option.propTypes = {
  data: PropTypes.shape({
    segment: PropTypes.shape({
      name: PropTypes.string.isRequired,
      pointsCount: PropTypes.number.isRequired,
      hUp: PropTypes.number.isRequired,
      hDown: PropTypes.number.isRequired
    }).isRequired
  }).isRequired
}
export default Option
