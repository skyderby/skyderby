import React from 'react'
import Select from 'react-select/async'
import axios from 'axios'

const searchProfiles = async search => {
  const dataUrl = `/api/v1/profiles?search=${search}`

  const {
    data: { items }
  } = await axios.get(dataUrl)

  const options = items.map(el => ({ value: `profiles/${el.id}`, label: el.name, type: 'profile' }))

  return options
}

const searchPlaces = async search => {
  const dataUrl = `/api/v1/places?search=${search}`

  const {
    data: { items }
  } = await axios.get(dataUrl)

  const options = items.map(el => ({ value: `places/${el.id}`, label: el.name, type: 'places' }))

  return options
}

const loadOptions = async search => {
  const resultsByType = await Promise.all([searchProfiles(search), searchPlaces(search)])

  return [].concat(...resultsByType)
}

const TracksFilter = () => {
  return (
    <Select
      isMulti
      loadOptions={loadOptions}
      placeholder="Search by pilot, place, suit"
    />
  )
}

export default TracksFilter
