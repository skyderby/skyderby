import React, { useCallback } from 'react'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import PropTypes from 'prop-types'

import selectStyles from 'styles/selectStyles'
import Option from './Option'
import SingleValue from './SingleValue'
import { useQueryClient } from 'react-query'
import { suitsQuery, useSuitQuery } from 'api/hooks/suits'
import {
  getQueryKey as getMakeQueryKey,
  useManufacturerQuery
} from 'api/hooks/manufacturer'

const SuitSelect = ({ value: suitId, ...props }) => {
  const queryClient = useQueryClient()
  const { data: suit } = useSuitQuery(suitId)
  const { data: make } = useManufacturerQuery(suit?.makeId)

  const selectedOption = suit ? { value: suit.id, label: suit.name, ...suit, make } : null

  const loadOptions = useCallback(
    async (search, _loadedOptions, { page }) => {
      const data = await queryClient.fetchQuery(suitsQuery({ page, search }, queryClient))
      const { items, currentPage, totalPages } = data

      const hasMore = currentPage < totalPages
      const options = items.map(el => ({
        value: el.id,
        label: el.name,
        ...el,
        make: queryClient.getQueryData(getMakeQueryKey(el.makeId))
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
      styles={selectStyles}
      {...props}
    />
  )
}

SuitSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

export default SuitSelect
