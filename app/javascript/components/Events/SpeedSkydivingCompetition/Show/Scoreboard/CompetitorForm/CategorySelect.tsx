import React from 'react'
import Select, { Props } from 'react-select'

import { useCategoriesQuery } from 'api/hooks/speedSkydivingCompetitions'
import getSelectStyles from 'styles/selectStyles'

interface CategorySelectProps extends Omit<Props, 'value'> {
  eventId: number
  value?: number
}

const CategorySelect = ({
  eventId,
  value,
  ...props
}: CategorySelectProps): JSX.Element => {
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
      styles={getSelectStyles()}
      menuPortalTarget={document.getElementById('dropdowns-root')}
    />
  )
}

export default CategorySelect
