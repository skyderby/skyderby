import React, { useCallback } from 'react'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import { useQueryClient } from 'react-query'

import { profilesQuery, useProfileQuery } from 'api/hooks/profiles'
import selectStyles from 'styles/selectStyles'

type ProfileSelectProps = {
  value?: number
}

const ProfileSelect = ({
  value: profileId,
  ...props
}: ProfileSelectProps): JSX.Element => {
  const queryClient = useQueryClient()
  const { data: profile } = useProfileQuery(profileId)

  const selectedOption = profile ? { value: profile.id, label: profile.name } : null

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
      menuPortalTarget={document.getElementById('dropdowns-root')}
      {...props}
    />
  )
}

export default ProfileSelect
