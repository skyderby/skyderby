import React from 'react'
import { useQueryClient } from 'react-query'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import PropTypes from 'prop-types'

import { usePlaceQuery, placesQuery } from 'api/hooks/places'
import selectStyles from 'styles/selectStyles'
import Option from './Option'
import SingleValue from './SingleValue'

const PlaceSelect = ({ value: placeId, ...props }) => {
  const queryClient = useQueryClient()
  const { data: place } = usePlaceQuery(placeId)
  const selectedValue = place ? { value: place.id, label: place.name, ...place } : null

  const loadOptions = async (search, _loadedOptions, { page }) => {
    const data = await queryClient.fetchQuery(placesQuery({ search, page }, queryClient))

    const { items, currentPage, totalPages } = data

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
