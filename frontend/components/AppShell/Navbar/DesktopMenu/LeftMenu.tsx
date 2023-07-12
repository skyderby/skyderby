import React from 'react'
import CollapsibleMenu from './CollapsibleMenu'
import useI18n from 'components/useI18n'
import translations from './translations.json'

const LeftMenu = () => {
  const { t } = useI18n(translations)

  const menuItems = [
    { href: '/tracks', text: t('tracks'), visibleByDefault: true },
    { href: '/events', text: t('competitions'), visibleByDefault: true },
    {
      href: '/virtual_competitions',
      text: t('online_competitions'),
      visibleByDefault: true
    },
    {
      href: '/flight_profiles',
      text: t('flight_profiles'),
      visibleByDefault: true
    },
    { href: '/profiles', text: t('profiles'), visibleByDefault: false },
    { href: '/places', text: t('places'), visibleByDefault: false },
    { href: '/suits', text: t('suits'), visibleByDefault: false }
  ]

  return <CollapsibleMenu menuItems={menuItems} />
}

export default LeftMenu
