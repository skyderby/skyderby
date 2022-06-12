import React from 'react'
import { Link } from 'react-router-dom'

import Logo from 'icons/logo.svg'
import DesktopMenu from './DesktopMenu'
import MobileMenu from './MobileMenu'
import styles from './styles.module.scss'

const Navbar = (): JSX.Element => {
  return (
    <nav className={styles.header}>
      <Link to="/" className={styles.home}>
        <Logo />
        Skyderby
      </Link>

      <DesktopMenu />
      <MobileMenu />
    </nav>
  )
}

export default Navbar
