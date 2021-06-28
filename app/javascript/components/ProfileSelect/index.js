import React, { useCallback } from 'react'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import { useQueryClient } from 'react-query'

import { profilesQuery, useProfileQuery } from 'api/hooks/profiles'
import selectStyles from 'styles/selectStyles'
import PropTypes from 'prop-types'

const ProfileSelect = ({ value: profileId, ...props }) => {
  const queryClient = useQueryClient()
  const { data: profile } = useProfileQuery(profileId)

  const selectedOption = profile ? { value: el.id, label: el.name } : null

  const loadOptions = useCallback(
    async (search, _loadedOptions, { page }) => {
      const data = await queryClient.fetchQuery(
        profilesQuery({ page, search }, queryClient)
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
      styles={selectStyles}
      {...props}
    />
  )
}

ProfileSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

export default ProfileSelect
