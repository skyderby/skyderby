import React, { useCallback } from 'react'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import { Props } from 'react-select'
import { useQueryClient } from '@tanstack/react-query'

import { countriesQuery, useCountryQuery } from 'api/countries'
import getSelectStyles from 'styles/selectStyles'

type Option = {
  value: number
  label: string
}

interface CountrySelectProps extends Omit<Props<Option, false>, 'value'> {
  value?: number
}

const CountrySelect = ({ value: countryId, ...props }: CountrySelectProps) => {
  const queryClient = useQueryClient()
  const { data: country } = useCountryQuery(countryId)

  const selectedOption = country ? { value: country.id, label: country.name } : null

  const loadOptions = useCallback(
    async (search: string, _loadedOptions: unknown, meta: unknown) => {
      const { page } = meta as { page: number }
      const data = await queryClient.fetchQuery(countriesQuery({ page, search }))

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
      styles={getSelectStyles<Option>()}
      menuPortalTarget={document.getElementById('dropdowns-root')}
      {...props}
    />
  )
}

export default CountrySelect
