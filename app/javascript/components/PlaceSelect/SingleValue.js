import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

import PlaceLabel from 'components/PlaceLabel'

const SingleValue = ({ data: { value }, ...props }) => (
  <components.SingleValue {...props}>
    <PlaceLabel placeId={value} />
  </components.SingleValue>
)

SingleValue.propTypes = {
  data: PropTypes.shape({
    value: PropTypes.number.isRequired
  }).isRequired
}

export default SingleValue
