import React, { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Props } from 'react-select'
import { AsyncPaginate as Select } from 'react-select-async-paginate'

import { usePlaceQuery, placesQuery } from 'api/places'
import getSelectStyles from 'styles/selectStyles'
import Option from './Option'
import SingleValue from './SingleValue'
import { OptionType } from './types'

interface PlaceSelectProps extends Omit<Props<OptionType, boolean>, 'value'> {
  value?: number
  hide?: boolean
  isInvalid?: string | boolean
}

const PlaceSelect = ({ value: placeId, ...props }: PlaceSelectProps): JSX.Element => {
  const queryClient = useQueryClient()
  const { data: place } = usePlaceQuery(placeId)

  const selectedOption = place ? { value: place.id, label: place.name } : null

  const loadOptions = useCallback(
    async (search: string, _loadedOptions: unknown, meta: unknown) => {
      const { page } = meta as { page: number }
      const data = await queryClient.fetchQuery(placesQuery({ search, page }))

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
      styles={getSelectStyles<OptionType>()}
      value={selectedOption}
      {...props}
    />
  )
}

export type { OptionType }

export default PlaceSelect
