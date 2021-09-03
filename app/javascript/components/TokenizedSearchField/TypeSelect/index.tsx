import React from 'react'
import Select, { NamedProps } from 'react-select'

import CalendarIcon from 'icons/calendar.svg'
import PlaceIcon from 'icons/location.svg'
import SuitIcon from 'icons/suit.svg'
import UserIcon from 'icons/user.svg'

import Option from './Option'

import styles from '../selectStyles'

const options = [
  { label: 'Profile', value: 'profileId', icon: <UserIcon /> },
  { label: 'Place', value: 'placeId', icon: <PlaceIcon /> },
  { label: 'Suit', value: 'suitId', icon: <SuitIcon /> },
  { label: 'Year', value: 'year', icon: <CalendarIcon /> }
]

const TypeSelect = (props: NamedProps): JSX.Element => {
  return (
    <Select
      components={{ Option }}
      options={options}
      placeholder="Search or filter tracks"
      styles={styles}
      {...props}
    />
  )
}

export default TypeSelect
