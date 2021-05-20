import React from 'react'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import PlaceIcon from 'icons/location.svg'
import Navbar from './Navbar'
import styles from './styles.module.scss'

const Header = ({ place }) => {
  const { t } = useI18n()
  return (
    <div className={styles.container}>
      <div className={styles.cover} style={{ backgroundImage: `url(${place.cover})` }} />
      <h2 className={styles.title}>{place.name}</h2>
      <div className={styles.coordinates}>
        <PlaceIcon />
        <span>Lat: {place.latitude}</span>
        <span>Lon: {place.longitude}</span>
        {place.msl !== undefined && (
          <span>
            MSL: {place.msl} {t('units.m')}
          </span>
        )}
      </div>

      <Navbar place={place} />
    </div>
  )
}

Header.propTypes = {
  place: PropTypes.shape({
    name: PropTypes.string.isRequired,
    cover: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    msl: PropTypes.number
  }).isRequired
}
export default Header
