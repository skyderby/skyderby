import React from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'

import { useTerrainProfilesQuery } from 'api/hooks/terrainProfiles'
import { usePlaceQueries } from 'api/hooks/places'
import selectStyles from 'styles/selectStyles'

const TerrainProfileSelect = ({ value, ...props }) => {
  const { data } = useTerrainProfilesQuery()
  const terrainProfiles = data?.items || []
  const placeQueries = usePlaceQueries(terrainProfiles.map(el => el.placeId))
  const places = placeQueries.map(query => query.data)

  const options = terrainProfiles.map(el => {
    const place = places.find(place => place.id === el.placeId)

    return {
      ...el,
      value: el.id,
      label: `${place?.name} - ${el.name}`
    }
  })

  const selectedOption = value && options.find(el => el.value === value)

  return (
    <Select
      isClearable
      menuPlacement="auto"
      options={options}
      value={selectedOption}
      aria-label="Select terrain profile"
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
