import React from 'react'
import PropTypes from 'prop-types'

import { Dropdown, DropdownMenu, DropdownItem } from './elements'

const Option = ({ onSelect, ...option }) => (
  <DropdownItem onClick={() => onSelect(option)} tabIndex={1}>
    {option.icon}
    <span>{option.label}</span>
  </DropdownItem>
)

const OptionsDropdown = ({ options, getOptionLabel = () => {}, onSelect, ...props }) => {
  return (
    <Dropdown>
      <DropdownMenu {...props}>
        {options.map((option, idx) => (
          <Option
            key={option.key || option.value || idx}
            label={getOptionLabel?.(option)}
            onSelect={onSelect}
            {...option}
          />
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}

OptionsDropdown.propTypes = {
  onSelect: PropTypes.func.isRequired,
  getOptionLabel: PropTypes.func,
  options: PropTypes.array
}

export default OptionsDropdown
