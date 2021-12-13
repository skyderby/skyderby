import React from 'react'

import { useLogoutMutation } from 'api/sessions'
import { useI18n } from 'components/TranslationsProvider'
import ExitIcon from 'icons/exit.svg'
import styles from './styles.module.scss'

const LogoutButton = () => {
  const { t } = useI18n()
  const logoutMutation = useLogoutMutation()

  const handleLogout = () => logoutMutation.mutate({})

  return (
    <button
      onClick={handleLogout}
      className={styles.logoutButton}
      title={t('application.header.sign_out')}
    >
      <ExitIcon />
    </button>
  )
}

export default LogoutButton
