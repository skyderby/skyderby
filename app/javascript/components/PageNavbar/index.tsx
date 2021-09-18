import React, { useLayoutEffect, useRef } from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

type PageNavbarProps = {
  children: React.ReactNode | React.ReactNode[]
}

const PageNavbar = ({ children }: PageNavbarProps): JSX.Element => {
  const menuRef = useRef<HTMLUListElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const menuElement = menuRef.current
    const fadeElement = fadeRef.current

    if (!menuElement || !fadeElement) return

    const handleScroll = () => {
      const scrollable =
        menuElement.scrollLeft + menuElement.clientWidth + 18 < menuElement.scrollWidth
      fadeElement.style.visibility = scrollable ? 'visible' : 'hidden'
      fadeElement.style.opacity = String(scrollable ? 1 : 0)
    }

    handleScroll()
    menuElement.addEventListener('scroll', handleScroll)

    return () => menuElement.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.fade} ref={fadeRef} />
      <ul className={styles.menu} ref={menuRef}>
        {children}
      </ul>
    </div>
  )
}

type ItemProps = {
  children: React.ReactNode | React.ReactNode[]
  right?: boolean
}

const Item = ({ children, right }: ItemProps) => (
  <li className={cx(styles.menuItem, right && styles.right)}>{children}</li>
)
PageNavbar.Item = Item

const Spacer = () => <li className={styles.spacer}>&nbsp;</li>
PageNavbar.Spacer = Spacer

Item.propTypes = {
  children: PropTypes.node.isRequired,
  right: PropTypes.bool
}

PageNavbar.propTypes = {
  children: PropTypes.node
}

export default PageNavbar
