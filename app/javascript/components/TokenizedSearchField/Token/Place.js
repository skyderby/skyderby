import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import { usePlaceQuery } from 'api/hooks/places'
import { useCountryQuery } from 'api/hooks/countries'
import IconTimes from 'icons/times.svg'
import PlaceLabel from 'components/PlaceLabel'
import styles from './styles.module.scss'

const Place = ({ value, onClick, onDelete }) => {
  const deleteButtonRef = useRef()

  const { data: place, isLoading } = usePlaceQuery(value)
  const { data: country } = useCountryQuery(place?.countryId)

  if (isLoading) return null

  const handleTokenClick = e => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current || deleteButtonRef.current.contains(e.target)

    if (deleteButtonClicked) {
      onDelete()
    }

    onClick?.()
  }

  const title = `Place: ${place.name}`

  return (
    <li className={styles.placeContainer} onClick={handleTokenClick} title={title}>
      <div className={styles.type}>Place</div>
      <div className={styles.value}>
        <PlaceLabel name={place.name} code={country.code} />
        <button
          className={styles.deleteButton}
          title="Delete"
          type="button"
          ref={deleteButtonRef}
        >
          <IconTimes />
        </button>
      </div>
    </li>
  )
}

Place.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func
}

export default Place
