import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import OptionsDropdown from './OptionsDropdown'

const ValueSelect = ({ settings, inputValue, onSelect }) => {
  const [options, setOptions] = useState([])

  useEffect(() => {
    settings.getOptions(inputValue).then(setOptions)
  }, [settings, inputValue])

  return (
    <OptionsDropdown
      options={options}
      getOptionLabel={settings.getOptionLabel}
      onSelect={onSelect}
    />
  )
}

ValueSelect.propTypes = {
  settings: PropTypes.shape({
    getOptions: PropTypes.func.isRequired,
    getOptionLabel: PropTypes.func
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  inputValue: PropTypes.string
}

export default ValueSelect
