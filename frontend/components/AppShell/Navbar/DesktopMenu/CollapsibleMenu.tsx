'use client'

import React, { useRef, useState } from 'react'
import cx from 'clsx'

import useClickOutside from 'components/useClickOutside'
import Dropdown from 'components/Dropdown'
import ChevronDownIcon from 'icons/chevron-down.svg'
import NavLink from './NavLink'
import useCollapsedItems from './useCollapsedItems'
import styles from './styles.module.scss'

type Props = {
  menuItems: {
    href: string
    text: string
    visibleByDefault: boolean
  }[]
}

const CollapsibleMenu = ({ menuItems }: Props) => {
  const menuRef = useRef<HTMLUListElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownToggleRef = useRef<HTMLLIElement>(null)
  const [showCollapsed, setShowCollapsed] = useState<boolean>()
  const isCollapsed = useCollapsedItems(menuRef, dropdownToggleRef)

  useClickOutside([dropdownRef, dropdownToggleRef], () => setShowCollapsed(false))

  const itemsInMainMenu = menuItems.filter(item => item.visibleByDefault)
  const dropdownItems = itemsInMainMenu
    .filter(item => isCollapsed(item.href))
    .concat(menuItems.filter(item => !item.visibleByDefault))

  return (
    <ul className={styles.menu} ref={menuRef}>
      {itemsInMainMenu.map(item => (
        <li
          key={item.href}
          className={cx(styles.menuItem, isCollapsed(item.href) && styles.collapsed)}
        >
          <NavLink href={item.href}>{item.text}</NavLink>
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
              {dropdownItems.map(item => (
                <li key={item.href} className={styles.dropdownItem}>
                  <NavLink href={item.href}>{item.text}</NavLink>
                </li>
              ))}
            </ul>
          </Dropdown>
        )}
      </li>
    </ul>
  )
}

export default CollapsibleMenu
