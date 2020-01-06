import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

import PlaceLabel from 'components/PlaceLabel'

const Option = ({ data: { name, countryCode }, ...props }) => (
  <components.Option {...props}>
    <PlaceLabel name={name} code={countryCode} />
  </components.Option>
)

Option.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    countryCode: PropTypes.string
  }).isRequired
}
export default Option
