import React from 'react'
import Select, { Props } from 'react-select'

const allYears = Array(new Date().getFullYear() - 2014 + 1)
  .fill(undefined)
  .map((_v, idx) => 2014 + idx)

export interface OptionType {
  label: string
  value: number
}

interface YearSelectProps extends Omit<Props<OptionType, boolean>, 'value'> {
  value?: number
}

const YearSelect = ({ value, ...props }: YearSelectProps): JSX.Element => {
  const options = allYears.map(year => ({ label: String(year), value: year }))
  const selectedOption = options.find(option => option.value === value)

  return <Select options={options} value={selectedOption} {...props} />
}

export default YearSelect
