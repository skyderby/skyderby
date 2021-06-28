import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

import PlaceLabel from 'components/PlaceLabel'

const SingleValue = ({ data: { name, country }, ...props }) => {
  return (
    <components.SingleValue {...props}>
      <PlaceLabel name={name} code={country?.code} />
    </components.SingleValue>
  )
}

SingleValue.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    country: PropTypes.shape({
      code: PropTypes.string
    })
  }).isRequired
}

export default SingleValue
