import React from 'react'
import axios from 'axios'

import PlaceLabel from 'components/PlaceLabel'
import SuitLabel from 'components/SuitLabel'
import UserIcon from 'icons/user.svg'
import PlaceIcon from 'icons/location.svg'
import SuitIcon from 'icons/suit.svg'
import CalendarIcon from 'icons/calendar.svg'

/* eslint-disable react/prop-types */
const placePresenter = ({ value }) => (
  <PlaceLabel name={value.name} code={value.countryCode} />
)

const suitPresenter = ({ value }) => <SuitLabel name={value.name} code={value.makeCode} />
/* eslint-enable react/prop-types */

export default () => [
  {
    type: 'profile',
    icon: <UserIcon />,
    label: 'Pilot',
    getOptions: async input => {
      const dataUrl = `/api/v1/profiles?search=${input}&perPage=10`

      const {
        data: { items }
      } = await axios.get(dataUrl)

      return items.map(profile => ({
        value: profile,
        key: profile.id,
        label: profile.name
      }))
    }
  },
  {
    type: 'suit',
    icon: <SuitIcon />,
    label: 'Suit',
    getOptions: async input => {
      const dataUrl = `/api/v1/suits?search=${input}&perPage=10`

      const {
        data: { items }
      } = await axios.get(dataUrl)

      return items.map(suit => ({
        value: suit,
        key: suit.id
      }))
    },
    getOptionLabel: suitPresenter
  },
  {
    type: 'place',
    icon: <PlaceIcon />,
    label: 'Place',
    getOptions: async input => {
      const dataUrl = `/api/v1/places?search=${input}&perPage=10`

      const {
        data: { items }
      } = await axios.get(dataUrl)

      return items.map(place => ({
        value: place,
        key: place.id
      }))
    },
    getOptionLabel: placePresenter
  },
  {
    type: 'year',
    icon: <CalendarIcon />,
    label: 'Year',
    getOptions: async input => {
      const years = Array(new Date().getFullYear() - 2014 + 1)
        .fill()
        .map((_v, idx) => 2014 + idx)
        .map(year => ({ label: year.toString(), value: year }))

      return years.filter(({ label }) => label.includes(input))
    }
  }
]
