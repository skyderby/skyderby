import React from 'react'
import Select from 'react-select-async-paginate'

import Api from 'api'

import Option from './Option'
import SingleValue from './SingleValue'

const loadOptions = async (search, _loadedOptions, { page }) => {
  const { items, currentPage, totalPages } = await Api.Suit.findAll({ search, page })
  const makes = await Api.Manufacturer.pickAll(items.map(el => el.makeId)).then(data =>
    Object.fromEntries(data.items.map(el => [el.id, el]))
  )

  const hasMore = currentPage < totalPages
  const options = items.map(el => ({
    value: el.id,
    label: el.name,
    ...el,
    make: makes[el.makeId]
  }))

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
