import React from 'react'
import Select from 'react-select'
import { useSelector } from 'react-redux'

import { terrainProfilesSelector } from 'redux/terrainProfiles'
import { usePageContext } from 'components/PageContext'
import selectStyles from 'styles/selectStyles'

const TerrainProfileSelect = props => {
  const { selectedTerrainProfile } = usePageContext()
  const terrainProfiles = useSelector(terrainProfilesSelector)

  const options = terrainProfiles.map(el => ({
    ...el,
    value: el.id,
    label: `${el.place.name} - ${el.name}`
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
      styles={selectStyles}
      {...props}
    />
  )
}

export default TerrainProfileSelect
