import React from 'react'
import PropTypes from 'prop-types'

import UserIcon from 'icons/user.svg'
import PlaceIcon from 'icons/location.svg'
import SuitIcon from 'icons/suit.svg'
import CalendarIcon from 'icons/calendar.svg'
import { Dropdown, DropdownMenu, DropdownItem } from './elements'

const TypeDropdown = ({ onSelect }) => {
  const options = [
    { label: 'Pilot', value: 'profile', icon: <UserIcon /> },
    { label: 'Suit', value: 'suit', icon: <SuitIcon /> },
    { label: 'Place', value: 'place', icon: <PlaceIcon /> },
    { label: 'Year', value: 'year', icon: <CalendarIcon /> }
  ]

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

TypeDropdown.propTypes = {
  onSelect: PropTypes.func.isRequired
}

export default TypeDropdown
