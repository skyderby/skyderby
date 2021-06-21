import React from 'react'
import ReactSelect from 'react-select'
import PropTypes from 'prop-types'

const styles = {
  container: base => ({
    ...base,
    flexGrow: 1
  })
}

const theme = theme => ({
  ...theme,
  borderRadius: 4,
  spacing: {
    ...theme.spacing,
    controlHeight: 30,
    baseUnit: 2
  }
})

const Select = ({ value, options, ...props }) => {
  const selectedOption = options.find(el => el.value === value)

  return (
    <ReactSelect
      value={selectedOption}
      options={options}
      styles={styles}
      theme={theme}
      {...props}
    />
  )
}

Select.propTypes = {
  value: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })
  ).isRequired
}

export default Select
