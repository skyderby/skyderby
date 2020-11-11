import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'

import { selectCurrentUser, logout } from 'redux/session'
import { useI18n } from 'components/TranslationsProvider'
import NewTrackForm from 'components/NewTrackForm'
import Logo from 'icons/logo.svg'
import ExitIcon from 'icons/exit.svg'

import LocaleSelector from './LocaleSelector'
import CurrentUser from './CurrentUser'
import styles from './styles.module.scss'

const Navbar = () => {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const [showModal, setShowModal] = useState(false)
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
            <li>
              <button className={styles.uploadTrack} onClick={() => setShowModal(true)}>
                {t('application.header.upload_track')}
              </button>
              <NewTrackForm
                isShown={showModal}
                onHide={() => setShowModal(false)}
                loggedIn={currentUser?.authorized}
              />
            </li>

            <li>
              <CurrentUser user={currentUser} />
            </li>

            <li>
              <button
                onClick={handleLogout}
                className={styles.logoutButton}
                title={t('application.header.sign_out')}
              >
                <ExitIcon />
              </button>
            </li>
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
      </ul>
    </nav>
  )
}

export default Navbar
