import React, { useCallback } from 'react'
import { Props } from 'react-select'
import { AsyncPaginate } from 'react-select-async-paginate'

import getSelectStyles from 'styles/selectStyles'
import Option from './Option'
import SingleValue from './SingleValue'
import { useQueryClient } from '@tanstack/react-query'
import { suitsQuery, useSuitQuery } from 'api/suits'
import { getCachedManufacturers, useManufacturerQuery } from 'api/manufacturer'

import { OptionType } from './types'

interface SuitSelectProps extends Omit<Props<OptionType, false>, 'value'> {
  value?: number | undefined
  hide?: boolean
  isInvalid?: string | boolean
}

const SuitSelect = ({ value: suitId, ...props }: SuitSelectProps) => {
  const queryClient = useQueryClient()
  const { data: suit } = useSuitQuery(suitId)
  const { data: make } = useManufacturerQuery(suit?.makeId)

  const selectedOption = suit ? { value: suit.id, label: suit.name, ...suit, make } : null

  const loadOptions = useCallback(
    async (search: string, _loadedOptions: unknown, meta: unknown) => {
      const { page } = meta as { page: number }
      const data = await queryClient.fetchQuery(suitsQuery({ page, search }))
      const { items, currentPage, totalPages } = data
      const manufacturers = getCachedManufacturers(
        items.map(suit => suit.makeId),
        queryClient
      )

      const hasMore = currentPage < totalPages
      const options = items.map(el => ({
        value: el.id,
        label: el.name,
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
    <AsyncPaginate
      components={{ Option, SingleValue }}
      value={selectedOption}
      loadOptions={loadOptions}
      additional={{ page: 1 }}
      styles={getSelectStyles<OptionType, false>()}
      {...props}
    />
  )
}

export type { OptionType }

export default SuitSelect
