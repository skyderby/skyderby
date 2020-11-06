import React, { useEffect } from 'react'
import Select from 'react-select'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { loadTerrainProfiles, selectAllTerrainProfiles } from 'redux/terrainProfiles'
import selectStyles from 'styles/selectStyles'

const TerrainProfileSelect = ({ value, ...props }) => {
  const dispatch = useDispatch()
  const terrainProfiles = useSelector(selectAllTerrainProfiles)

  useEffect(() => {
    dispatch(loadTerrainProfiles())
  }, [dispatch])

  const options = terrainProfiles.map(el => ({
    ...el,
    value: el.id,
    label: `${el.place.name} - ${el.name}`
  }))

  const selectedOption = value && options.find(el => el.value === value)

  return (
    <Select
      isClearable
      menuPlacement="auto"
      options={options}
      value={selectedOption}
      placeholder="Select terrain profile"
      styles={selectStyles}
      {...props}
    />
  )
}

TerrainProfileSelect.propTypes = {
  value: PropTypes.number
}

export default TerrainProfileSelect
