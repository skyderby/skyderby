import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { selectCurrentUser, logout } from 'redux/session'
import { useI18n } from 'components/TranslationsProvider'
import NewTrackForm from 'components/NewTrackForm'
import ExitIcon from 'icons/exit.svg'
import LocaleSelector from './LocaleSelector'
import CurrentUser from './CurrentUser'
import styles from './styles.module.scss'

const RightMenuDesktop = () => {
  const dispatch = useDispatch()
  const { t } = useI18n()
  const [showModal, setShowModal] = useState(false)
  const currentUser = useSelector(selectCurrentUser)

  const handleLogout = () => dispatch(logout())

  return (
    <ul className={styles.rightMenuDesktop}>
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

          <LocaleSelector />
        </>
      )}
    </ul>
  )
}

export default RightMenuDesktop
