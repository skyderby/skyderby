import React from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'

const styles = {
  container: base => ({
    ...base,
    flexGrow: 1
  })
}

const GroupSelect = ({ options, ...props }) => {
  return <Select options={options} styles={styles} {...props} />
}

GroupSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.arrayOf(PropTypes.number).isRequired
    })
  ).isRequired
}
export default GroupSelect
