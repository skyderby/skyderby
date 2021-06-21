import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

import PlaceLabel from 'components/PlaceLabel'

const SingleValue = ({ data: { name, countryCode }, ...props }) => {
  return (
    <components.SingleValue {...props}>
      <PlaceLabel name={name} code={countryCode} />
    </components.SingleValue>
  )
}

SingleValue.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    countryCode: PropTypes.string
  }).isRequired
}

export default SingleValue
