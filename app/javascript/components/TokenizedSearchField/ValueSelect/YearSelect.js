import React from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'

const allYears = Array(new Date().getFullYear() - 2014 + 1)
  .fill()
  .map((_v, idx) => (2014 + idx).toString())

const YearSelect = ({ value, ...props }) => {
  const options = allYears.map(year => ({ label: year, value: year }))
  const selectedOption = options.find(option => option.value === value)

  return <Select options={options} value={selectedOption} {...props} />
}

YearSelect.propTypes = {
  value: PropTypes.oneOf(allYears)
}

export default YearSelect
