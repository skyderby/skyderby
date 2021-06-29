import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

import PlaceLabel from 'components/PlaceLabel'

const Option = ({ value, ...props }) => (
  <components.Option {...props}>
    <PlaceLabel placeId={value} />
  </components.Option>
)

Option.propTypes = {
  value: PropTypes.number.isRequired
}

export default Option
