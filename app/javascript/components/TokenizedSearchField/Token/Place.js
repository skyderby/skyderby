import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { loadPlace, createPlaceSelector } from 'redux/places'
import IconTimes from 'icons/times.svg'
import PlaceLabel from 'components/PlaceLabel'
import { PlaceContainer, Type, Value, DeleteButton } from './elements'

const Place = ({ value, onClick, onDelete }) => {
  const dispatch = useDispatch()
  const deleteButtonRef = useRef()

  useEffect(() => {
    dispatch(loadPlace(value))
  }, [dispatch, value])

  const data = useSelector(createPlaceSelector(value))

  if (!data) return null

  const handleTokenClick = e => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current || deleteButtonRef.current.contains(e.target)

    if (deleteButtonClicked) {
      onDelete?.()
    }

    onClick?.()
  }

  const title = `Place: ${data.name}`

  return (
    <PlaceContainer onClick={handleTokenClick} title={title}>
      <Type>Place</Type>
      <Value>
        <PlaceLabel name={data.name} code={data.countryCode} />
        <DeleteButton title="Delete" type="button" ref={deleteButtonRef}>
          <IconTimes />
        </DeleteButton>
      </Value>
    </PlaceContainer>
  )
}

Place.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default Place
