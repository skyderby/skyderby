import React from 'react'
import PropTypes from 'prop-types'

import { Dropdown, DropdownMenu, DropdownItem } from './elements'

const OptionsDropdown = ({ options, onSelect }) => {
  return (
    <Dropdown>
      <DropdownMenu>
        {options.map(({ label, icon, value }) => (
          <DropdownItem key={value} onClick={() => onSelect(value)} tabIndex={1}>
            {icon}
            <span>{label}</span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}

OptionsDropdown.propTypes = {
  onSelect: PropTypes.func.isRequired,
  options: PropTypes.array
}

export default OptionsDropdown
