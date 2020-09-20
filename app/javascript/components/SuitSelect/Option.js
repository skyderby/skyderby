import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'

const Option = ({
  data: {
    name,
    make: { code }
  },
  ...props
}) => (
  <components.Option {...props}>
    <SuitLabel name={name} code={code} />
  </components.Option>
)

Option.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    make: PropTypes.shape({
      code: PropTypes.string
    })
  }).isRequired
}

export default Option
