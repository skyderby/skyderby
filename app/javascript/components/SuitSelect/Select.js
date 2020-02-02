import React from 'react'
import Select from 'react-select-async-paginate'
import axios from 'axios'

import Option from './Option'
import SingleValue from './SingleValue'

const loadOptions = async (search, _loadedOptions, { page }) => {
  const dataUrl = `/api/v1/suits?search=${search}&page=${page}`

  const {
    data: { items, currentPage, totalPages }
  } = await axios.get(dataUrl)

  const hasMore = currentPage < totalPages
  const options = items.map(el => ({ value: el.id, label: el.name, ...el }))

  return {
    options,
    hasMore,
    additional: {
      page: currentPage + 1
    }
  }
}

const SuitSelect = props => {
  return (
    <Select
      components={{ Option, SingleValue }}
      loadOptions={loadOptions}
      additional={{ page: 1 }}
      {...props}
    />
  )
}

export default SuitSelect
