import React from 'react'
import PropTypes from 'prop-types'

import PlaceLabel from 'components/PlaceLabel'
import PlaceIcon from 'icons/location.svg'

import styles from './styles.module.scss'
import { usePlaceQuery } from 'api/hooks/places'
import { useCountryQuery } from 'api/hooks/countries'

const Place = ({ placeId, placeName: userProvidedPlaceName }) => {
  const { data: place } = usePlaceQuery(placeId)
  const { data: country } = useCountryQuery(place?.countryId)

  const placeName = placeId ? place?.name : userProvidedPlaceName
  const countryCode = country?.code

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
