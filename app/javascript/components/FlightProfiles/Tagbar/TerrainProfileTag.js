import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import IconTimes from 'icons/times.svg'

import { createTerrainProfileSelector } from 'redux/terrainProfiles'

import styles from './styles.module.scss'

const TerrainProfile = ({ terrainProfileId, onDelete }) => {
  const terrainProfile = useSelector(createTerrainProfileSelector(terrainProfileId))

  if (!terrainProfile) return null

  const {
    place: { name: placeName },
    name
  } = terrainProfile

  return (
    <li className={styles.tag}>
      <span className={styles.label}>
        {placeName} - {name}
      </span>
      <button className={styles.deleteButton} type="button" onClick={onDelete}>
        <IconTimes />
      </button>
    </li>
  )
}

TerrainProfile.propTypes = {
  terrainProfileId: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default TerrainProfile
