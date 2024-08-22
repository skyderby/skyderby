import React from 'react'
import Select, { Props } from 'react-select'

import { useCategoriesQuery } from 'api/performanceCompetitions'
import getSelectStyles from 'styles/selectStyles'

type Option = {
  value: number
  label: string
}

type CategorySelectProps = Omit<Props<Option, false>, 'value'> & {
  eventId: number
  value?: number
}

const CategorySelect = ({ eventId, value, ...props }: CategorySelectProps) => {
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
      styles={getSelectStyles<Option>()}
      menuPortalTarget={document.getElementById('dropdowns-root')}
    />
  )
}

export default CategorySelect
