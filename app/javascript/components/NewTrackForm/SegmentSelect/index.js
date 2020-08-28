import React from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'

import selectStyles from 'styles/selectStyles'

import Option from './Option'

const SegmentSelect = ({ value, options, onChange, ...props }) => {
  const selectedOption = options[value]

  return (
    <Select
      styles={selectStyles}
      value={selectedOption}
      options={options}
      onChange={({ value }) => onChange(value)}
      components={{ Option }}
      {...props}
    />
  )
}

SegmentSelect.propTypes = {
  value: PropTypes.number.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      segment: PropTypes.shape({
        name: PropTypes.string.isRequired,
        pointsCount: PropTypes.number.isRequired,
        hUp: PropTypes.number.isRequired,
        hDown: PropTypes.number.isRequired
      }).isRequired
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired
}

export default SegmentSelect
