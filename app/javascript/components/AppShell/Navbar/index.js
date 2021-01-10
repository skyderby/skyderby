import React from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import Logo from 'icons/logo.svg'
import RightMenuDesktop from './RightMenuDesktop'
import MenuMobile from './MenuMobile'
import styles from './styles.module.scss'

const Navbar = () => {
  const { t } = useI18n()

  return (
    <nav className={styles.header}>
      <Link to="/" className={styles.home}>
        <Logo />
        Skyderby
      </Link>

      <ul className={styles.menu}>
        <li className={styles.menuItem}>
          <NavLink to="/tracks">{t('application.header.tracks')}</NavLink>
        </li>
        <li className={styles.menuItem}>
          <NavLink to="/events">{t('application.header.competitions')}</NavLink>
        </li>
        <li className={styles.menuItem}>
          <NavLink to="/virtual_competitions">
            {t('application.header.online_competitions')}
          </NavLink>
        </li>
        <li className={styles.menuItem}>
          <NavLink to="/places">{t('application.header.places')}</NavLink>
        </li>
      </ul>

      <RightMenuDesktop />
      <MenuMobile />
    </nav>
  )
}

export default Navbar
