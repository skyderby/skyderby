import React, { useCallback } from 'react'
import { Props } from 'react-select'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import { useQueryClient } from '@tanstack/react-query'

import { profilesQuery, useProfileQuery } from 'api/profiles'
import getSelectStyles from 'styles/selectStyles'

export interface OptionType {
  label: string
  value: number
}

interface ProfileSelectProps extends Omit<Props<OptionType, boolean>, 'value'> {
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
    async (search: string, _loadedOptions: unknown, meta: unknown) => {
      const { page } = meta as { page: number }
      const data = await queryClient.fetchQuery(profilesQuery({ page, search }))

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

export default ProfileSelect
