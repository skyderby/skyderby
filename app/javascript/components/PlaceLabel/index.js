import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

const PlaceLabel = ({ name, msl, code }) => {
  const { t } = useI18n()

  return (
    <span>
      {name && <span>{name}</span>}
      {msl !== undefined && (
        <>
          &nbsp;
          <span>
            (MSL: {msl.toFixed(1)} {t('units.m')})
          </span>
        </>
      )}
      {code && (
        <>
          &nbsp;
          <span className={styles.separator}>{'//'}</span>
          &nbsp;
          <span className={styles.countryCode}>{code}</span>
        </>
      )}
    </span>
  )
}

PlaceLabel.propTypes = {
  name: PropTypes.string,
  code: PropTypes.string,
  msl: PropTypes.number
}

export default PlaceLabel
