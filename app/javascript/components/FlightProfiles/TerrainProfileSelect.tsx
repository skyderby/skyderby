import React from 'react'
import Select, { Props } from 'react-select'

import { useTerrainProfilesQuery } from 'api/terrainProfiles'
import { usePlaces } from 'api/places'
import getSelectStyles from 'styles/selectStyles'

type OptionType = {
  value: number
  label: string
}

type TerrainProfileSelectProps = Omit<Props<OptionType>, 'value'> & {
  value?: number | null
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
    <Select<OptionType>
      isClearable
      menuPlacement="auto"
      options={options}
      value={selectedOption}
      aria-label="Select terrain profile"
      placeholder="Select terrain profile"
      styles={getSelectStyles<OptionType>()}
      {...props}
    />
  )
}

export default TerrainProfileSelect
