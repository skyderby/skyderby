import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { usePlaceQuery } from 'api/hooks/places'
import { useCountryQuery } from 'api/hooks/countries'
import PlaceIcon from 'icons/location.svg'
import styles from './styles.module.scss'

type PlaceLabelProps = {
  placeId?: number
  fallbackName?: string
  withIcon?: boolean
  withMsl?: boolean
  refetchEnabled?: boolean
}

const PlaceLabel = ({
  placeId,
  fallbackName,
  withIcon = false,
  withMsl = false,
  refetchEnabled
}: PlaceLabelProps): JSX.Element => {
  const { t } = useI18n()
  const enabled = refetchEnabled ?? true
  const { data: place } = usePlaceQuery(placeId, { enabled })
  const { data: country } = useCountryQuery(place?.countryId, { enabled })

  const { name = fallbackName, msl } = place ?? {}

  return (
    <div className={styles.container}>
      {withIcon && <PlaceIcon />}
      {name && <span>{name}</span>}
      {withMsl && msl !== undefined && (
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

export default PlaceLabel
