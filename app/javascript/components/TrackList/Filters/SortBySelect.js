import React from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'

const styles = {
  control: base => ({
    ...base,
    minHeight: '35px',
    borderRadius: 'var(--border-radius-md)'
  }),
  dropdownIndicator: base => ({
    ...base,
    alignSelf: 'baseline',
    padding: '6px'
  })
}

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

const SortBySelect = ({ sortBy, onChange }) => {
  const value = options.find(el => el.value === sortBy) || options[0]

  return (
    <Select
      value={value}
      options={options}
      styles={styles}
      onChange={({ value }) => onChange(value)}
    />
  )
}

SortBySelect.propTypes = {
  sortBy: PropTypes.oneOfType(options.map(el => el.value)),
  onChange: PropTypes.func.isRequired
}

export default SortBySelect
