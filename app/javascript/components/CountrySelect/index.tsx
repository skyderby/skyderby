import React, { useCallback } from 'react'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import { Props } from 'react-select'
import { useQueryClient } from 'react-query'

import { countriesQuery, useCountryQuery } from 'api/countries'
import getSelectStyles from 'styles/selectStyles'

interface CountrySelectProps extends Omit<Props, 'value'> {
  value?: number
}

const CountrySelect = ({
  value: countryId,
  ...props
}: CountrySelectProps): JSX.Element => {
  const queryClient = useQueryClient()
  const { data: country } = useCountryQuery(countryId)

  const selectedOption = country ? { value: country.id, label: country.name } : null

  const loadOptions = useCallback(
    async (search, _loadedOptions, { page }) => {
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
      styles={getSelectStyles()}
      menuPortalTarget={document.getElementById('dropdowns-root')}
      {...props}
    />
  )
}

export default CountrySelect
