import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'

const Option = ({ data: { name, makeCode }, ...props }) => (
  <components.Option {...props}>
    <SuitLabel name={name} code={makeCode} />
  </components.Option>
)

Option.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    makeCode: PropTypes.string
  }).isRequired
}

export default Option
