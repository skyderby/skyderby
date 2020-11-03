import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'

import { selectCurrentUser, logout } from 'redux/session'
import { useI18n } from 'components/TranslationsProvider'
import Logo from 'icons/logo.svg'
import ExitIcon from 'icons/exit.svg'

import LocaleSelector from './LocaleSelector'
import CurrentUser from './CurrentUser'
import styles from './styles.module.scss'

const Navbar = () => {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { t } = useI18n()

  const handleLogout = () => dispatch(logout())

  return (
    <nav className={styles.header}>
      <Link to="/" className={styles.home}>
        <Logo />
        Skyderby
      </Link>

      <ul className={styles.menu}>
        <li>
          <NavLink to="/tracks">{t('application.header.tracks')}</NavLink>
        </li>
        <li>
          <NavLink to="/events">{t('application.header.competitions')}</NavLink>
        </li>
        <li>
          <NavLink to="/virtual_competitions">
            {t('application.header.online_competitions')}
          </NavLink>
        </li>
        <li>
          <NavLink to="/places">{t('application.header.places')}</NavLink>
        </li>
      </ul>

      <ul className={styles.rightMenu}>
        {currentUser?.authorized ? (
          <>
            <CurrentUser user={currentUser} />
          </>
        ) : (
          <>
            <li>
              <Link
                to={location => ({
                  pathname: '/sign-in',
                  state: { afterLoginUrl: location.pathname }
                })}
              >
                {t('application.header.sign_in')}
              </Link>
            </li>
            <li>
              <Link to="/sign-up">{t('application.header.sign_up')}</Link>
            </li>
          </>
        )}

        <LocaleSelector />

        {currentUser?.authorized && (
          <li>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
              title={t('application.header.sign_out')}
            >
              <ExitIcon />
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}

export default Navbar
