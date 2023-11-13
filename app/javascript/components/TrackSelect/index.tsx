import React, { useCallback, useEffect, useState } from 'react'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import type { Props } from 'react-select'
import { useQueryClient } from '@tanstack/react-query'

import getSelectStyles from 'styles/selectStyles'
import {
  tracksQuery,
  trackQuery,
  TrackIndexRecord,
  TrackFilters,
  TrackRecord
} from 'api/tracks'

const buildOption = (track: TrackIndexRecord | TrackRecord) => ({
  value: track.id,
  label: [`#${track.id}`, track.comment].filter(Boolean).join(' - ')
})

type TrackSelectProps = Omit<Props, 'value'> & {
  value: number
  filters: TrackFilters
}

const TrackSelect = ({
  value: trackId,
  filters,
  ...props
}: TrackSelectProps): JSX.Element => {
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
    <Select
      loadOptions={loadOptions}
      value={selectedOption}
      additional={{ page: 1 }}
      styles={getSelectStyles()}
      menuPortalTarget={document.getElementById('dropdowns-root')}
      {...props}
    />
  )
}

export default TrackSelect
