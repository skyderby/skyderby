import React from 'react'
import PropTypes from 'prop-types'

import Select, { useSuitValue } from 'components/SuitSelect'

import selectStyles from 'styles/selectStyles'

const SuitSelect = ({ value, onChange, ...props }) => {
  const [suit, setSuit] = useSuitValue(value)

  const handleChange = option => {
    setSuit(option)
    onChange(option.value)
  }

  return <Select value={suit} onChange={handleChange} styles={selectStyles} {...props} />
}

SuitSelect.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired
}

export default SuitSelect
