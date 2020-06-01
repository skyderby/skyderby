import React from 'react'

import UserIcon from 'icons/user.svg'
import Api from 'api'

const toOption = profile => ({
  value: profile.id,
  data: profile,
  label: profile.name
})

export default {
  type: 'profile',
  icon: <UserIcon />,
  label: 'Pilot',
  getOptions: async input => {
    const { items } = await Api.Profile.findAll({ search: input, perPage: 10 })

    return items.map(toOption)
  },
  loadOption: async id => {
    const profile = await Api.Profile.findRecord(id)

    return toOption(profile)
  }
}
