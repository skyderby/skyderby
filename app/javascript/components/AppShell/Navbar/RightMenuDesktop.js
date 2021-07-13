import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import { useCurrentUserQuery, useLogoutMutation } from 'api/hooks/sessions'
import { useI18n } from 'components/TranslationsProvider'
import NewTrackForm from 'components/NewTrackForm'
import ExitIcon from 'icons/exit.svg'
import LocaleSelector from './LocaleSelector'
import CurrentUser from './CurrentUser'
import styles from './styles.module.scss'

const RightMenuDesktop = () => {
  const { t } = useI18n()
  const [showModal, setShowModal] = useState(false)
  const { data: currentUser, isLoading } = useCurrentUserQuery()
  const logoutMutation = useLogoutMutation()

  const handleLogout = () => logoutMutation.mutate()

  return (
    <ul className={styles.rightMenuDesktop}>
      {!isLoading && currentUser.authorized && (
        <>
          <li key="upload-track" className={styles.menuItem}>
            <button className={styles.uploadTrack} onClick={() => setShowModal(true)}>
              {t('application.header.upload_track')}
            </button>
            <NewTrackForm
              isShown={showModal}
              onHide={() => setShowModal(false)}
              loggedIn={currentUser?.authorized}
            />
          </li>

          <li key="current-user">{!isLoading && <CurrentUser user={currentUser} />}</li>

          <li key="logout" className={styles.menuItem}>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
              title={t('application.header.sign_out')}
            >
              <ExitIcon />
            </button>
          </li>
        </>
      )}

      {!isLoading && !currentUser.authorized && (
        <>
          <li key="login" className={styles.menuItem}>
            <Link
              to={location => ({
                pathname: '/users/sign-in',
                state: { afterLoginUrl: location.pathname }
              })}
            >
              {t('application.header.sign_in')}
            </Link>
          </li>

          <li key="signup" className={styles.menuItem}>
            <Link to="/users/sign-up">{t('application.header.sign_up')}</Link>
          </li>
        </>
      )}

      <LocaleSelector className={styles.menuItem} />
    </ul>
  )
}

export default RightMenuDesktop