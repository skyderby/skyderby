import React from 'react'
import { Props } from 'react-select'

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

type ValueSelectProps<OptionType> = Omit<
  Props<OptionType, false>,
  'onChange' | 'value'
> & {
  type: ValueKey | undefined
  onChange: (value: TokenTuple) => void
}

type OptionType = { label: string; value: number }

const ValueSelect = ({ type, onChange, ...props }: ValueSelectProps<OptionType>) => {
  if (type === undefined) return null

  const ValueSelectComponent = componentByType[type]

  return (
    <ValueSelectComponent
      autoFocus
      openMenuOnFocus
      onChange={option => {
        if (option === null) return
        if ('value' in option) onChange([type, option.value])
      }}
      styles={getSelectStyles<OptionType, false>()}
      {...props}
    />
  )
}

export default ValueSelect
