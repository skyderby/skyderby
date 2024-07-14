import React, { useCallback, useEffect, useState } from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import { GroupBase, Props } from 'react-select'
import { useQueryClient } from '@tanstack/react-query'

import getSelectStyles from 'styles/selectStyles'
import { tracksQuery, trackQuery, TrackFilters } from 'api/tracks'

type Option = {
  value: number
  label: string
}

const buildOption = <T extends { id: number; comment: string }>(track: T) => ({
  value: track.id,
  label: [`#${track.id}`, track.comment].filter(Boolean).join(' - ')
})

type TrackSelectProps = Omit<Props<Option, false>, 'value'> & {
  value: number
  filters: TrackFilters
}

const TrackSelect = ({ value: trackId, filters, ...props }: TrackSelectProps) => {
  const queryClient = useQueryClient()
  const [selectedOption, setSelectedOption] = useState<{
    value: number
    label: string
  } | null>(null)

  useEffect(() => {
    if (!trackId) return

    queryClient
      .fetchQuery(trackQuery(trackId))
      .then(track => setSelectedOption(buildOption(track)))
  }, [trackId, queryClient])

  const loadOptions = useCallback(
    async (search: string, _loadedOptions: unknown, meta: unknown) => {
      const { page } = meta as {
        page: number
      }
      const data = await queryClient.fetchQuery(
        tracksQuery({ page, search, filters }, queryClient)
      )

      const { items, currentPage, totalPages } = data

      const hasMore = currentPage < totalPages
      const options = items.map(buildOption)

      return {
        options,
        hasMore,
        additional: {
          page: currentPage + 1
        }
      }
    },
    [queryClient, filters]
  )

  return (
    <AsyncPaginate<Option, GroupBase<Option>, { page: number }, false>
      loadOptions={loadOptions}
      value={selectedOption}
      additional={{ page: 1 }}
      styles={getSelectStyles<Option, false>()}
      menuPortalTarget={document.getElementById('dropdowns-root')}
      {...props}
    />
  )
}

export default TrackSelect
