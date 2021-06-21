import React from 'react'
import PropTypes from 'prop-types'

import Select, { usePlaceValue } from 'components/PlaceSelect'

const PlaceSelect = ({ value, onChange, ...props }) => {
  const [place, setPlace] = usePlaceValue(value)

  const handleChange = option => {
    setPlace(option)
    onChange(option.value)
  }

  return <Select value={place} onChange={handleChange} {...props} />
}

PlaceSelect.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired
}

export default PlaceSelect
