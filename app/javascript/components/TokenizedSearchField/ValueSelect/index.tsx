import React from 'react'
import { OptionTypeBase } from 'react-select'

import ProfileSelect from 'components/ProfileSelect'
import PlaceSelect from 'components/PlaceSelect'
import SuitSelect from 'components/SuitSelect'
import YearSelect from './YearSelect'
import styles from '../selectStyles'
import { TokenTuple, ValueKey } from '../types'

const componentByType = {
  year: YearSelect,
  placeId: PlaceSelect,
  profileId: ProfileSelect,
  suitId: SuitSelect
}

type ValueSelectProps = {
  type: ValueKey
  onChange: (value: TokenTuple) => unknown
}

const ValueSelect = ({ type, onChange, ...props }: ValueSelectProps): JSX.Element => {
  const ValueSelectComponent = componentByType[type]

  const handleChange = (option: OptionTypeBase) => onChange([type, option.value])

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

export default ValueSelect
