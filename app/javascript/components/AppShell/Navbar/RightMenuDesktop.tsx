import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useCurrentUserQuery } from 'api/sessions'
import { useI18n } from 'components/TranslationsProvider'
import NewTrackForm from 'components/NewTrackForm'
import LocaleSelector from './LocaleSelector'
import CurrentUser from './CurrentUser'
import LogoutButton from './LogoutButton'
import styles from './styles.module.scss'

const RightMenuDesktop = (): JSX.Element => {
  const { t } = useI18n()
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)
  const { data: currentUser, isLoading } = useCurrentUserQuery()

  return (
    <ul className={styles.rightMenuDesktop}>
      {!isLoading && (
        <>
          {currentUser?.authorized ? (
            <>
              <li className={styles.menuItem}>
                <button className={styles.uploadTrack} onClick={() => setShowModal(true)}>
                  {t('application.header.upload_track')}
                </button>
                <NewTrackForm isShown={showModal} onHide={() => setShowModal(false)} />
              </li>

              <li>
                <CurrentUser user={currentUser} />
              </li>

              <li className={styles.menuItem}>
                <LogoutButton />
              </li>
            </>
          ) : (
            <>
              <li className={styles.menuItem}>
                <Link to="/users/sign-in" state={{ returnTo: location.pathname }}>
                  {t('application.header.sign_in')}
                </Link>
              </li>

              <li className={styles.menuItem}>
                <Link to="/users/sign-up">{t('application.header.sign_up')}</Link>
              </li>
            </>
          )}
        </>
      )}
      <LocaleSelector className={styles.menuItem} />
    </ul>
  )
}

export default RightMenuDesktop
