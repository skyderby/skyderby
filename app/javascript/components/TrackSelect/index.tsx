import React, { useCallback } from 'react'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import { useQueryClient } from 'react-query'

import getSelectStyles from 'styles/selectStyles'
import PropTypes from 'prop-types'
import {
  useTrackQuery,
  tracksQuery,
  TrackIndexRecord,
  TrackFilters,
  TrackRecord
} from 'api/hooks/tracks'

const buildOption = (track: TrackIndexRecord | TrackRecord) => ({
  value: track.id,
  label: [`#${track.id}`, track.comment].filter(Boolean).join(' - ')
})

type TrackSelectProps = {
  value: number
  filters: TrackFilters
}

const TrackSelect = ({
  value: trackId,
  filters,
  ...props
}: TrackSelectProps): JSX.Element => {
  const queryClient = useQueryClient()
  const { data: track } = useTrackQuery(trackId)

  const selectedOption = track ? buildOption(track) : null

  const loadOptions = useCallback(
    async (search, _loadedOptions, { page }) => {
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

TrackSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  filters: PropTypes.object
}

export default TrackSelect
