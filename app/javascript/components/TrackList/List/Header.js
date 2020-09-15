import React from 'react'

import { useI18n } from 'components/TranslationsProvider'

import { Thead, Tr, TableCell } from './elements'

const Header = () => {
  const { t } = useI18n()

  return (
    <Thead>
      <Tr>
        <TableCell>{t('activerecord.attributes.track.id')}</TableCell>
        <TableCell>{t('activerecord.attributes.track.name')}</TableCell>
        <TableCell>{t('activerecord.attributes.track.suit')}</TableCell>
        <TableCell>{t('activerecord.attributes.track.place')}</TableCell>
        <TableCell>{t('activerecord.attributes.track.comment')}</TableCell>
        <TableCell>{t('disciplines.distance')}</TableCell>
        <TableCell>{t('disciplines.speed')}</TableCell>
        <TableCell>{t('disciplines.time')}</TableCell>
        <TableCell>{t('activerecord.attributes.track.recorded_at')}</TableCell>
      </Tr>
    </Thead>
  )
}

export default Header
