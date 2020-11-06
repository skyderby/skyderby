import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { loadPlace, createPlaceSelector } from 'redux/places'
import IconTimes from 'icons/times.svg'
import PlaceLabel from 'components/PlaceLabel'

import styles from './styles.module.scss'

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
      onDelete()
    }

    onClick?.()
  }

  const title = `Place: ${data.name}`

  return (
    <li className={styles.placeContainer} onClick={handleTokenClick} title={title}>
      <div className={styles.type}>Place</div>
      <div className={styles.value}>
        <PlaceLabel name={data.name} code={data.country.code} />
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
