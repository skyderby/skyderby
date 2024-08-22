import React from 'react'
import Select, { components, OptionProps, Props } from 'react-select'

import CalendarIcon from 'icons/calendar.svg'
import PlaceIcon from 'icons/location.svg'
import SuitIcon from 'icons/suit.svg'
import UserIcon from 'icons/user.svg'
import getSelectStyles from '../selectStyles'
import { allowedValueKeys } from '../types'

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

type TypeSelectProps = {
  exclude?: (typeof allowedValueKeys)[number]
}

const OptionComponent = (props: OptionProps<OptionType, false>) => (
  <components.Option {...props}>
    <span>{props.data.icon}</span>
    <span>{props.data.label}</span>
  </components.Option>
)

const TypeSelect = ({
  exclude,
  ...props
}: Props<OptionType, false> & TypeSelectProps) => {
  const possibleOptions = options.filter(option => option.value !== exclude)

  return (
    <Select<OptionType, false>
      components={{ Option: OptionComponent }}
      options={possibleOptions}
      placeholder="Search or filter tracks"
      styles={getSelectStyles<OptionType, false>()}
      {...props}
    />
  )
}

export default TypeSelect
