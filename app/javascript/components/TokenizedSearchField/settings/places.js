import React from 'react'

import PlaceLabel from 'components/PlaceLabel'
import PlaceIcon from 'icons/location.svg'
import Api from 'api'

/* eslint-disable react/prop-types */
const placePresenter = ({ data }) => (
  <PlaceLabel name={data.name} code={data.countryCode} />
)
/* eslint-enable react/prop-types */

const toOption = place => ({ value: place.id, data: place })

export default {
  type: 'place',
  icon: <PlaceIcon />,
  label: 'Place',
  getOptions: async input => {
    const { items } = await Api.Place.findAll({ search: input, perPage: 10 })

    return items.map(toOption)
  },
  getOptionLabel: placePresenter,
  loadOption: async id => {
    const place = await Api.Place.findRecord(id)

    return toOption(place)
  }
}
