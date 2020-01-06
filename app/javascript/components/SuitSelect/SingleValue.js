import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'

const SingleValue = ({ data: { name, makeCode }, ...props }) => (
  <components.SingleValue {...props}>
    <SuitLabel name={name} code={makeCode} />
  </components.SingleValue>
)

SingleValue.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    makeCode: PropTypes.string
  }).isRequired
}

export default SingleValue
