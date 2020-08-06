import React from 'react'
import I18n from 'i18n-js'

import { Thead, Tr, TableCell } from './elements'

const Header = () => {
  return (
    <Thead>
      <Tr>
        <TableCell>{I18n.t('activerecord.attributes.track.id')}</TableCell>
        <TableCell>{I18n.t('activerecord.attributes.track.name')}</TableCell>
        <TableCell>{I18n.t('activerecord.attributes.track.suit')}</TableCell>
        <TableCell>{I18n.t('activerecord.attributes.track.place')}</TableCell>
        <TableCell>{I18n.t('activerecord.attributes.track.comment')}</TableCell>
        <TableCell>{I18n.t('disciplines.distance')}</TableCell>
        <TableCell>{I18n.t('disciplines.speed')}</TableCell>
        <TableCell>{I18n.t('disciplines.time')}</TableCell>
        <TableCell>{I18n.t('activerecord.attributes.track.recorded_at')}</TableCell>
      </Tr>
    </Thead>
  )
}

export default Header
