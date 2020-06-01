import React from 'react'

import SuitLabel from 'components/SuitLabel'
import SuitIcon from 'icons/suit.svg'
import Api from 'api'

/* eslint-disable react/prop-types */
const suitPresenter = ({ data }) => <SuitLabel name={data.name} code={data.makeCode} />
/* eslint-enable react/prop-types */

const toOption = suit => ({
  value: suit.id,
  data: suit
})

export default {
  type: 'suit',
  icon: <SuitIcon />,
  label: 'Suit',
  getOptions: async input => {
    const { items } = await Api.Suit.findAll({ search: input, perPage: 10 })

    return items.map(toOption)
  },
  getOptionLabel: suitPresenter,
  loadOption: async id => {
    const suit = await Api.Suit.findRecord(id)

    return toOption(suit)
  }
}
