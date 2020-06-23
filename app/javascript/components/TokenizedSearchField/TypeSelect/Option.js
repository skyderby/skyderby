import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

const Option = props => (
  <components.Option {...props}>
    <span>{props.data.icon}</span>
    <span>{props.data.label}</span>
  </components.Option>
)

Option.propTypes = {
  data: PropTypes.shape({
    icon: PropTypes.node,
    label: PropTypes.string.isRequired
  }).isRequired
}

export default Option
