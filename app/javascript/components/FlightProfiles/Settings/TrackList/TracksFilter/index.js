import React from 'react'
import Select from 'react-select/async'
import axios from 'axios'

import Option from './Option'

const searchEndpoints = [
  { type: 'profile', endpoint: '/api/v1/profiles' },
  { type: 'place', endpoint: '/api/v1/places' },
  { type: 'suit', endpoint: '/api/v1/suits' }
]

const performSearch = async ({ search, type, endpoint }) => {
  const dataUrl = `${endpoint}?search=${search}&perPage=10`

  const {
    data: { items }
  } = await axios.get(dataUrl)

  const options = items.map(el => ({
    ...el,
    value: el.id,
    label: el.name,
    type
  }))

  return options
}

const loadOptions = async search => {
  const resultsByType = await Promise.all(
    searchEndpoints.map(endpoint => performSearch({ ...endpoint, search }))
  )

  return [].concat(...resultsByType)
}

const TracksFilter = () => {
  return (
    <Select
      isMulti
      loadOptions={loadOptions}
      placeholder="Search by pilot, place, suit"
      components={{ Option, IndicatorsContainer: () => null }}
    />
  )
}

export default TracksFilter
