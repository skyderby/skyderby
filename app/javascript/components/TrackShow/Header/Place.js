import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { selectPlace } from 'redux/places'
import PlaceLabel from 'components/PlaceLabel'
import PlaceIcon from 'icons/location.svg'

import { PlaceContainer } from './elements'

const Place = ({ placeId, placeName: userProvidedPlaceName }) => {
  const place = useSelector(state => selectPlace(state, placeId))

  const placeName = placeId ? place.name : userProvidedPlaceName
  const countryCode = place && place.countryCode

  return (
    <PlaceContainer>
      <PlaceIcon />
      <PlaceLabel name={placeName} code={countryCode} />
    </PlaceContainer>
  )
}

Place.propTypes = {
  placeId: PropTypes.number,
  placeName: PropTypes.string
}

export default Place
