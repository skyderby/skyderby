import React from 'react'
import Select from 'react-select-async-paginate'
import axios from 'axios'

const loadOptions = async (search, _loadedOptions, { page }) => {
  const dataUrl = `/api/v1/profiles?search=${search}&page=${page}`

  const {
    data: { items, currentPage, totalPages }
  } = await axios.get(dataUrl)

  const hasMore = currentPage < totalPages
  const options = items.map(el => ({ value: el.id, label: el.name }))

  return {
    options,
    hasMore,
    additional: {
      page: currentPage + 1
    }
  }
}

const ProfileSelect = props => {
  return <Select loadOptions={loadOptions} additional={{ page: 1 }} {...props} />
}

export default ProfileSelect
