import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

import PlaceLabel from 'components/PlaceLabel'

const Option = ({ data: { name, country }, ...props }) => (
  <components.Option {...props}>
    <PlaceLabel name={name} code={country?.code} />
  </components.Option>
)

Option.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    country: PropTypes.shape({
      code: PropTypes.string.isRequired
    })
  }).isRequired
}
export default Option
