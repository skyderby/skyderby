import React from 'react'
import Select from 'react-select'

const allYears = Array(new Date().getFullYear() - 2014 + 1)
  .fill(undefined)
  .map((_v, idx) => 2014 + idx)

type YearSelectProps = {
  value: number
}

const YearSelect = ({ value, ...props }: YearSelectProps): JSX.Element => {
  const options = allYears.map(year => ({ label: year, value: year }))
  const selectedOption = options.find(option => option.value === value)

  return <Select options={options} value={selectedOption} {...props} />
}

export default YearSelect
