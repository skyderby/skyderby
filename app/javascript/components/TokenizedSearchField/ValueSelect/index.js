import React from 'react'
import PropTypes from 'prop-types'

import ProfileSelect from 'components/ProfileSelect'
import PlaceSelect from 'components/PlaceSelect'
import SuitSelect from 'components/SuitSelect'
import YearSelect from './YearSelect'
import styles from '../selectStyles'

const componentByType = {
  year: YearSelect,
  placeId: PlaceSelect,
  profileId: ProfileSelect,
  suitId: SuitSelect
}

const ValueSelect = ({ type, onChange, ...props }) => {
  const ValueSelectComponent = componentByType[type]

  const handleChange = option => onChange([type, option.value])

  return (
    <ValueSelectComponent
      autoFocus
      openMenuOnFocus
      onChange={handleChange}
      styles={styles}
      {...props}
    />
  )
}

ValueSelect.propTypes = {
  type: PropTypes.oneOf(['placeId', 'profileId', 'suitId', 'year']).isRequired,
  onChange: PropTypes.func.isRequired
}

export default ValueSelect
