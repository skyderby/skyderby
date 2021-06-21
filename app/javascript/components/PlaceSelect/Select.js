import React from 'react'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import axios from 'axios'
import PropTypes from 'prop-types'

import selectStyles from 'styles/selectStyles'
import Option from './Option'
import SingleValue from './SingleValue'
import { usePlaceQuery } from 'api/hooks/places'

const loadOptions = async (search, _loadedOptions, { page }) => {
  const dataUrl = `/api/v1/places?search=${search}&page=${page}`

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

const PlaceSelect = ({ value: placeId, ...props }) => {
  const { data: place } = usePlaceQuery(placeId)
  const selectedValue = place ? { value: place.id, label: place.name, ...place } : null

  return (
    <Select
      components={{ Option, SingleValue }}
      loadOptions={loadOptions}
      additional={{ page: 1 }}
      styles={selectStyles}
      value={selectedValue}
      {...props}
    />
  )
}

PlaceSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

export default PlaceSelect
