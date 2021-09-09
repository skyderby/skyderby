import React, { useCallback } from 'react'
import { Props } from 'react-select'
import { AsyncPaginate as Select } from 'react-select-async-paginate'

import getSelectStyles from 'styles/selectStyles'
import Option from './Option'
import SingleValue from './SingleValue'
import { useQueryClient } from 'react-query'
import { suitsQuery, useSuitQuery } from 'api/hooks/suits'
import { getCachedManufacturers, useManufacturerQuery } from 'api/hooks/manufacturer'

import { OptionType } from './types'

type SuitSelectProps = Props<OptionType, boolean> & {
  value: number | undefined
  hide?: boolean
  isInvalid?: string | boolean
}

const SuitSelect = ({ value: suitId, ...props }: SuitSelectProps): JSX.Element => {
  const queryClient = useQueryClient()
  const { data: suit } = useSuitQuery(suitId)
  const { data: make } = useManufacturerQuery(suit?.makeId)

  const selectedOption = suit ? { value: suit.id, label: suit.name, ...suit, make } : null

  const loadOptions = useCallback(
    async (search, _loadedOptions, { page }) => {
      const data = await queryClient.fetchQuery(suitsQuery({ page, search }, queryClient))
      const { items, currentPage, totalPages } = data
      const manufacturers = getCachedManufacturers(
        items.map(suit => suit.makeId),
        queryClient
      )

      const hasMore = currentPage < totalPages
      const options = items.map(el => ({
        value: el.id,
        label: el.name,
        ...el,
        make: manufacturers.find(manufacturer => manufacturer.id === el.makeId)
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
      value={selectedOption}
      loadOptions={loadOptions}
      additional={{ page: 1 }}
      styles={getSelectStyles<OptionType>()}
      {...props}
    />
  )
}

export default SuitSelect
