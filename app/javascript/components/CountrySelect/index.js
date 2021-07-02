import React, { useCallback } from 'react'
import { AsyncPaginate as Select } from 'react-select-async-paginate'
import { useQueryClient } from 'react-query'

import { countriesQuery, useCountryQuery } from 'api/hooks/countries'
import selectStyles from 'styles/selectStyles'
import PropTypes from 'prop-types'

const CountrySelect = ({ value: countryId, ...props }) => {
  const queryClient = useQueryClient()
  const { data: country } = useCountryQuery(countryId)

  const selectedOption = country ? { value: country.id, label: country.name } : null

  const loadOptions = useCallback(
    async (search, _loadedOptions, { page }) => {
      const data = await queryClient.fetchQuery(
        countriesQuery({ page, search }, queryClient)
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

CountrySelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

export default CountrySelect
