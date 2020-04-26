import React from 'react'
import PropTypes from 'prop-types'

import { Dropdown, DropdownMenu } from './elements'

const ValueDropdown = ({ options }) => {
  return (
    <Dropdown>
      <DropdownMenu>{options}</DropdownMenu>
    </Dropdown>
  )
}

ValueDropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.node)
}

export default ValueDropdown
