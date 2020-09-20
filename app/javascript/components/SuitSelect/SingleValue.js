import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'

const SingleValue = ({ data: { name, make: { code } }, ...props }) => (
  <components.SingleValue {...props}>
    <SuitLabel name={name} code={code} />
  </components.SingleValue>
)

SingleValue.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    make: PropTypes.shape({
      code: PropTypes.string
    }).isRequired
  }).isRequired
}

export default SingleValue
