import React from 'react'
import { NamedProps, ValueType } from 'react-select'

import ProfileSelect from 'components/ProfileSelect'
import PlaceSelect from 'components/PlaceSelect'
import SuitSelect from 'components/SuitSelect'
import YearSelect from './YearSelect'
import getSelectStyles from '../selectStyles'
import { TokenTuple, ValueKey } from '../types'

const componentByType = {
  year: YearSelect,
  placeId: PlaceSelect,
  profileId: ProfileSelect,
  suitId: SuitSelect
}

type OptionType = { label: string; value: number }

type ValueSelectProps = Omit<NamedProps<OptionType>, 'onChange'> & {
  type: ValueKey | undefined
  onChange: (value: TokenTuple) => unknown
}

const ValueSelect = ({
  type,
  onChange,
  ...props
}: ValueSelectProps): JSX.Element | null => {
  if (type === undefined) return null

  const ValueSelectComponent = componentByType[type]

  const handleChange = (option: ValueType<OptionType, boolean>) => {
    if (option === null) return
    if ('value' in option) onChange([type, option.value])
  }

  return (
    <ValueSelectComponent
      autoFocus
      openMenuOnFocus
      onChange={handleChange}
      styles={getSelectStyles()}
      {...props}
    />
  )
}

export default ValueSelect
