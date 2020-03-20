import React from 'react'
import Select from 'react-select'
import { useSelector } from 'react-redux'

import { terrainProfilesSelector } from 'redux/terrainProfiles'
import { selectedTerrainProfileSelector } from 'redux/flightProfiles'

const TerrainProfileSelect = props => {
  const terrainProfiles = useSelector(terrainProfilesSelector)
  const selectedTerrainProfile = useSelector(selectedTerrainProfileSelector)

  const options = terrainProfiles.map(el => ({
    ...el,
    value: el.id,
    label: `${el.place.name} - ${el.name}`,
  }))

  const selectedOption =
    selectedTerrainProfile && options.find(el => el.value === selectedTerrainProfile)

  return (
    <Select
      isClearable
      menuPlacement="auto"
      options={options}
      value={selectedOption}
      placeholder="Select terrain profile"
      {...props}
    />
  )
}

export default TerrainProfileSelect
