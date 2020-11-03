import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { createPlaceSelector } from 'redux/places'
import PlaceLabel from 'components/PlaceLabel'
import PlaceIcon from 'icons/location.svg'

import styles from './styles.module.scss'

const Place = ({ placeId, placeName: userProvidedPlaceName }) => {
  const place = useSelector(createPlaceSelector(placeId))

  const placeName = placeId ? place.name : userProvidedPlaceName
  const countryCode = place?.country?.code

  return (
    <div className={styles.place}>
      <PlaceIcon />
      <PlaceLabel name={placeName} code={countryCode} />
    </div>
  )
}

Place.propTypes = {
  placeId: PropTypes.number,
  placeName: PropTypes.string
}

export default Place
