import React from 'react'
import Select, { Props } from 'react-select'

import CalendarIcon from 'icons/calendar.svg'
import PlaceIcon from 'icons/location.svg'
import SuitIcon from 'icons/suit.svg'
import UserIcon from 'icons/user.svg'
import getSelectStyles from '../selectStyles'
import { allowedValueKeys } from '../types'
import Option from './Option'

const options = [
  { label: 'Profile', value: 'profileId', icon: <UserIcon /> },
  { label: 'Place', value: 'placeId', icon: <PlaceIcon /> },
  { label: 'Suit', value: 'suitId', icon: <SuitIcon /> },
  { label: 'Year', value: 'year', icon: <CalendarIcon /> }
]

type OptionType = {
  label: string
  value: string
  icon: React.ReactNode
}

type TypeSelectProps = Props<OptionType> & { exclude?: typeof allowedValueKeys[number] }

const TypeSelect = ({ exclude, ...props }: TypeSelectProps): JSX.Element => {
  const possibleOptions = options.filter(option => option.value !== exclude)

  return (
    <Select<OptionType, false>
      components={{ Option }}
      options={possibleOptions}
      placeholder="Search or filter tracks"
      styles={getSelectStyles<OptionType>()}
      {...props}
    />
  )
}

export default TypeSelect
