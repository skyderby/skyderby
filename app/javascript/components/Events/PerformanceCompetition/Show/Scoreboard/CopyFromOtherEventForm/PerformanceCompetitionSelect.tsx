import React, { useCallback } from 'react'
import { Props } from 'react-select'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import { useQueryClient } from 'react-query'

import getSelectStyles from 'styles/selectStyles'
import {
  usePerformanceCompetitionQuery,
  performanceCompetitionsQuery
} from 'api/performanceCompetitions'

export interface OptionType {
  label: string
  value: number
}

interface PerformanceCompetitionSelectProps
  extends Omit<Props<OptionType, boolean>, 'value'> {
  value?: number
}

const PerformanceCompetitionSelect = ({
  value: eventId,
  ...props
}: PerformanceCompetitionSelectProps) => {
  const queryClient = useQueryClient()
  const { data: event } = usePerformanceCompetitionQuery(eventId)

  const selectedOption = event ? { value: event.id, label: event.name } : null

  const loadOptions = useCallback(
    async (search: string, _loadedOptions: unknown, meta: unknown) => {
      const { page } = meta as { page: number }
      const data = await queryClient.fetchQuery(
        performanceCompetitionsQuery({ page, search })
      )

      const { items, currentPage, totalPages } = data

      const hasMore = currentPage < totalPages
      const options = items.map(el => ({ value: el.id, label: el.name }))

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
      loadOptions={loadOptions}
      value={selectedOption}
      additional={{ page: 1 }}
      styles={getSelectStyles<OptionType>()}
      {...props}
    />
  )
}

export default PerformanceCompetitionSelect
