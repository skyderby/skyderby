import React from 'react'
import Select, { Props } from 'react-select'

import CalendarIcon from 'icons/calendar.svg'
import PlaceIcon from 'icons/location.svg'
import SuitIcon from 'icons/suit.svg'
import UserIcon from 'icons/user.svg'
import getSelectStyles from '../selectStyles'
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

const TypeSelect = (props: Props<OptionType>): JSX.Element => {
  return (
    <Select<OptionType, false>
      components={{ Option }}
      options={options}
      placeholder="Search or filter tracks"
      styles={getSelectStyles<OptionType>()}
      {...props}
    />
  )
}

export default TypeSelect
