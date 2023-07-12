import React from 'react'
import Link from 'next/link'

import getCurrentUser from 'api/getCurrentUser'
import Logo from 'icons/logo.svg'
import DesktopMenu from './DesktopMenu'
// import MobileMenu from './MobileMenu'
import styles from './styles.module.scss'

const Navbar = async () => {
  return (
    <nav className={styles.header}>
      <Link href="/" className={styles.home}>
        <Logo />
        Skyderby
      </Link>

      <DesktopMenu />
      {/*<MobileMenu />*/}
    </nav>
  )
}

export default Navbar
