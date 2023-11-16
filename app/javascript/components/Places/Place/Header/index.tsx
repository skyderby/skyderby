import React from 'react'

import { useI18n } from 'components/TranslationsProvider'
import { Place } from 'api/places'
import PlaceIcon from 'icons/location.svg'
import Navbar from './Navbar'
import styles from './styles.module.scss'

type HeaderProps = {
  place: Place
}

const Header = ({ place }: HeaderProps): JSX.Element => {
  const { t } = useI18n()
  return (
    <div className={styles.container}>
      <div className={styles.cover} style={{ backgroundImage: `url(${place.cover})` }} />
      <h2 className={styles.title}>{place.name}</h2>
      <div className={styles.coordinates}>
        <PlaceIcon />
        <span>Lat: {place.latitude}</span>
        <span>Lon: {place.longitude}</span>
        {place.msl !== undefined && place.msl !== null && (
          <span>
            MSL: {place.msl} {t('units.m')}
          </span>
        )}
      </div>

      <Navbar place={place} />
    </div>
  )
}

export default Header
