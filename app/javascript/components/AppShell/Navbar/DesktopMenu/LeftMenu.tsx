import React, { useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import cx from 'clsx'

import useClickOutside from 'hooks/useClickOutside'
import { useI18n } from 'components/TranslationsProvider'
import Dropdown from 'components/Dropdown'
import ChevronDownIcon from 'icons/chevron-down.svg'
import useCollapsedItems from './useCollapsedItems'
import styles from './styles.module.scss'

const LeftMenu = () => {
  const { t } = useI18n()
  const menuRef = useRef<HTMLUListElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownToggleRef = useRef<HTMLLIElement>(null)
  const [showCollapsed, setShowCollapsed] = useState<boolean>()
  const isCollapsed = useCollapsedItems(menuRef, dropdownToggleRef)

  useClickOutside([dropdownRef, dropdownToggleRef], () => setShowCollapsed(false))

  const menuItems = [
    { href: '/tracks', text: t('application.header.tracks') },
    { href: '/events', text: t('application.header.competitions') },
    { href: '/online_rankings', text: t('application.header.online_competitions') },
    { href: '/flight_profiles', text: t('flight_profiles.title') }
  ]

  return (
    <ul className={styles.menu} ref={menuRef}>
      {menuItems.map(item => (
        <li
          key={item.href}
          className={cx(styles.menuItem, isCollapsed(item.href) && styles.collapsed)}
        >
          <NavLink to={item.href}>{item.text}</NavLink>
        </li>
      ))}

      <li className={styles.overflowMenu} ref={dropdownToggleRef}>
        <button onClick={() => setShowCollapsed(show => !show)}>
          Explore &nbsp;
          <ChevronDownIcon />
        </button>
        {showCollapsed && (
          <Dropdown
            ref={dropdownRef}
            referenceElement={dropdownToggleRef.current}
            options={{ placement: 'bottom-end' }}
          >
            <ul onClick={() => setShowCollapsed(false)}>
              {menuItems
                .filter(item => isCollapsed(item.href))
                .map(item => (
                  <li key={item.href} className={styles.dropdownItem}>
                    <NavLink to={item.href}>{item.text}</NavLink>
                  </li>
                ))}
              <li className={styles.dropdownItem}>
                <NavLink to="/profiles">{t('profiles.title')}</NavLink>
              </li>
              <li className={styles.dropdownItem}>
                <NavLink to="/places">{t('application.header.places')}</NavLink>
              </li>
              <li className={styles.dropdownItem}>
                <NavLink to="/suits">{t('suits.title')}</NavLink>
              </li>
            </ul>
          </Dropdown>
        )}
      </li>
    </ul>
  )
}

export default LeftMenu
