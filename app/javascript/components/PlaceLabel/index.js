import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { usePlaceQuery } from 'api/hooks/places'
import { useCountryQuery } from 'api/hooks/countries'
import PlaceIcon from 'icons/location.svg'
import styles from './styles.module.scss'

const PlaceLabel = ({
  placeId,
  fallbackName,
  withIcon = false,
  withMsl = false,
  refetchEnabled
}) => {
  const { t } = useI18n()
  const enabled = refetchEnabled ?? true
  const { data: place } = usePlaceQuery(placeId, { enabled })
  const { data: country } = useCountryQuery(place?.countryId, { enabled })

  const { name = fallbackName, msl } = place ?? {}

  return (
    <div className={styles.container}>
      {withIcon && <PlaceIcon />}
      {name && <span>{name}</span>}
      {withMsl && (
        <>
          &nbsp;
          <span>
            (MSL: {msl.toFixed(1)} {t('units.m')})
          </span>
        </>
      )}
      {country && (
        <>
          &nbsp;
          <span className={styles.separator}>{'//'}</span>
          &nbsp;
          <span className={styles.countryCode}>{country?.code}</span>
        </>
      )}
    </div>
  )
}

PlaceLabel.propTypes = {
  placeId: PropTypes.number,
  fallbackName: PropTypes.string,
  withIcon: PropTypes.bool,
  withMsl: PropTypes.bool,
  refetchEnabled: PropTypes.bool
}

export default PlaceLabel
