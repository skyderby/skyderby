import React from 'react'
import PropTypes from 'prop-types'

import Select, { usePlaceValue } from 'components/PlaceSelect'

import selectStyles from 'styles/selectStyles'

const PlaceSelect = ({ value, onChange, ...props }) => {
  const [place, setPlace] = usePlaceValue(value)

  const handleChange = option => {
    setPlace(option)
    onChange(option.value)
  }

  return <Select value={place} onChange={handleChange} styles={selectStyles} {...props} />
}

PlaceSelect.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired
}

export default PlaceSelect
