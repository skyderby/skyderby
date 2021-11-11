import React from 'react'
import Select from 'react-select'

import getSelectStyles from 'styles/selectStyles'
import { IndexParams, isAllowedSort } from 'api/tracks'

const options = [
  { label: 'Id: Desc', value: 'id desc' },
  { label: 'Id: Asc', value: 'id asc' },
  { label: 'Date of recording: Desc', value: 'recorded_at desc' },
  { label: 'Date of recording: Asc', value: 'recorded_at asc' },
  { label: 'Speed: Desc', value: 'speed desc' },
  { label: 'Speed: Asc', value: 'speed asc' },
  { label: 'Distance: Desc', value: 'distance desc' },
  { label: 'Distance: Asc', value: 'distance asc' },
  { label: 'Time: Desc', value: 'time desc' },
  { label: 'Time: Asc', value: 'time asc' }
]

type OptionType = {
  label: string
  value: string
}

type SortSelectProps = {
  onChange: (value: IndexParams['sortBy'] | undefined) => void
  value?: IndexParams['sortBy']
}

const SortBySelect = ({ value, onChange }: SortSelectProps): JSX.Element => {
  const selectedOption = options.find(el => el.value === value) || options[0]

  return (
    <Select<OptionType, false>
      value={selectedOption}
      options={options}
      styles={getSelectStyles<OptionType>()}
      onChange={option => {
        if (option === null) {
          onChange(undefined)
        } else if (isAllowedSort(option.value)) {
          onChange(option.value)
        }
      }}
    />
  )
}

export default SortBySelect
