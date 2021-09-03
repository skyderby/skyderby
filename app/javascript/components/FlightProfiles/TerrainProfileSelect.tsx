import React from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'

import { useTerrainProfilesQuery } from 'api/hooks/terrainProfiles'
import { usePlaces } from 'api/hooks/places'
import selectStyles from 'styles/selectStyles'

type TerrainProfileSelectProps = {
  value?: number
}

const TerrainProfileSelect = ({
  value,
  ...props
}: TerrainProfileSelectProps): JSX.Element => {
  const { data: terrainProfiles = [] } = useTerrainProfilesQuery()
  const places = usePlaces(terrainProfiles.map(el => el.placeId))

  const options = terrainProfiles.map(el => {
    const place = places.find(place => place.id === el.placeId)

    return {
      value: el.id,
      label: `${place?.name} - ${el.name}`
    }
  })

  const selectedOption = value ? options.find(el => el.value === value) : null

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
