import React from 'react'
import { Link } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import PageWrapper from 'components/Users/PageWrapper'
import styles from 'components/Users/styles.module.scss'

const SuccessRegistration = () => {
  const { t } = useI18n()

  return (
    <PageWrapper>
      <div className={styles.container}>
        <p className={styles.title}>{t('devise.registrations.signed_up')}</p>
        <div className={styles.icon}>📬</div>
        <p className={styles.description}>
          {t('devise.registrations.signed_up_but_unconfirmed')}
        </p>

        <Link className={styles.primaryButton} to="/">
          {t('devise.registrations.back_to_main_page')}
        </Link>

        <Link className={styles.tertiaryButton} to="/email-confirmation">
          {t('devise.shared.links.didn_t_receive_confirmation_instructions')}
        </Link>
      </div>
    </PageWrapper>
  )
}

export default SuccessRegistration
