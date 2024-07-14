import React from 'react'
import Select, { Props } from 'react-select'

const allYears = Array(new Date().getFullYear() - 2014 + 1)
  .fill(undefined)
  .map((_v, idx) => 2014 + idx)

export type OptionType = {
  value: number
  label: string
}

type YearSelectProps = Omit<Props<OptionType, false>, 'value'> & {
  value?: number
}

const YearSelect = ({ value, ...props }: YearSelectProps) => {
  const options = allYears.map(year => ({ label: String(year), value: year }))
  const selectedOption = options.find(option => option.value === value)

  return <Select options={options} value={selectedOption} {...props} />
}

export default YearSelect
