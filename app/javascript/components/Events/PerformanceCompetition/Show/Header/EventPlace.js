import React from 'react'
import PropTypes from 'prop-types'

import { usePlaceQuery } from 'api/hooks/places'
import { useCountryQuery } from 'api/hooks/countries'
import PlaceIcon from 'icons/location.svg'
import PlaceLabel from 'components/PlaceLabel'
import styles from './styles.module.scss'

const EventPlace = ({ placeId }) => {
  const { data: place } = usePlaceQuery(placeId)
  const { data: country } = useCountryQuery(place?.countryId)

  return (
    <div className={styles.eventPlace}>
      <PlaceIcon />
      <PlaceLabel name={place?.name} msl={place?.msl} code={country?.code} />
    </div>
  )
}

EventPlace.propTypes = {
  placeId: PropTypes.number.isRequired
}

export default EventPlace
