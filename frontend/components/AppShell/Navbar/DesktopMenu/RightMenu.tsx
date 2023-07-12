import React from 'react'
import Link from 'next/link'

import getCurrentUser from 'api/getCurrentUser'
import logout from 'api/logout'
import useI18n from 'components/useI18n'
import LocaleSelector from '../LocaleSelector'
import CurrentUser from '../CurrentUser'
import NewTrackButton from './NewTrackButton'
import LogoutButton from '../LogoutButton'
import translations from './translations.json'
import styles from './styles.module.scss'

const RightMenu = async () => {
  const { t } = useI18n(translations)
  const location = { pathname: '/pathname' }
  const currentUser = await getCurrentUser()

  return (
    <ul className={styles.rightMenuDesktop}>
      {currentUser?.authorized ? (
        <>
          <li className={styles.menuItem}>
            {/*<NewTrackButton>{t('upload_track')}</NewTrackButton>*/}
          </li>

          <li>
            <CurrentUser user={currentUser} />
          </li>

          <li className={styles.menuItem}>
            <LogoutButton title={t('sign_out')} action={logout} />
          </li>
        </>
      ) : (
        <>
          <li className={styles.menuItem}>
            <Link href="/users/sign-in" state={{ returnTo: location.pathname }}>
              {t('sign_in')}
            </Link>
          </li>

          <li className={styles.menuItem}>
            <Link href="/users/sign-up">{t('sign_up')}</Link>
          </li>
        </>
      )}

      <LocaleSelector className={styles.menuItem} />
    </ul>
  )
}

export default RightMenu
