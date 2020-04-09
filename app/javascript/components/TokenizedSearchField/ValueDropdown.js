import React from 'react'

import { Dropdown, DropdownMenu, DropdownItem } from './elements'

const ValueDropdown = ({ options }) => {
  return (
    <Dropdown>
      <DropdownMenu>
        {options}
      </DropdownMenu>
    </Dropdown>
  )
}

export default ValueDropdown
