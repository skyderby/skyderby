import React, { useCallback } from 'react'
import { useQueryClient } from 'react-query'
import { AsyncPaginate as Select } from 'react-select-async-paginate'

import { usePlaceQuery, placesQuery } from 'api/hooks/places'
import selectStyles from 'styles/selectStyles'
import Option from './Option'
import SingleValue from './SingleValue'

type PlaceSelectProps = {
  value?: number
}

const PlaceSelect = ({ value: placeId, ...props }: PlaceSelectProps): JSX.Element => {
  const queryClient = useQueryClient()
  const { data: place } = usePlaceQuery(placeId)

  const selectedOption = place ? { value: place.id, label: place.name } : null

  const loadOptions = useCallback(
    async (search, _loadedOptions, { page }) => {
      const data = await queryClient.fetchQuery(
        placesQuery({ search, page }, queryClient)
      )

      const { items, currentPage, totalPages } = data

      const hasMore = currentPage < totalPages
      const options = items.map(el => ({
        value: el.id,
        label: el.name
      }))

      return {
        options,
        hasMore,
        additional: {
          page: currentPage + 1
        }
      }
    },
    [queryClient]
  )

  return (
    <Select
      components={{ Option, SingleValue }}
      loadOptions={loadOptions}
      additional={{ page: 1 }}
      styles={selectStyles}
      value={selectedOption}
      {...props}
    />
  )
}

export default PlaceSelect
