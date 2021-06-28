import React, { useCallback } from 'react'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import { useQueryClient } from 'react-query'

import { profilesQuery } from 'api/hooks/profiles'
import selectStyles from 'styles/selectStyles'

const ProfileSelect = props => {
  const queryClient = useQueryClient()

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
      additional={{ page: 1 }}
      styles={selectStyles}
      {...props}
    />
  )
}

export default ProfileSelect
