import React from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'

import { useCategoriesQuery } from 'api/hooks/performanceCompetitions'
import selectStyles from 'styles/selectStyles'

const CategorySelect = ({ eventId, value, ...props }) => {
  const { data: categories = [] } = useCategoriesQuery(eventId)

  const options = categories.map(category => ({
    value: category.id,
    label: category.name
  }))

  const selectedOption = options.find(option => option.value === value)

  return (
    <Select
      options={options}
      value={selectedOption}
      {...props}
      styles={selectStyles}
      menuPortalTarget={document.getElementById('dropdowns-root')}
    />
  )
}

CategorySelect.propTypes = {
  eventId: PropTypes.number.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

export default CategorySelect
