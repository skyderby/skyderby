import React, { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useConfirmEmailMutation } from 'api/users'
import { useI18n } from 'components/TranslationsProvider'
import styles from 'components/Users/styles.module.scss'
import LoadingSpinner from 'components/LoadingSpinner'

const EmailConfirmation = () => {
  const { t } = useI18n()
  const [params] = useSearchParams()
  const confirmationToken = params.get('confirmation_token') ?? ''
  const mutation = useConfirmEmailMutation()
  const confirmEmail = mutation.mutate

  useEffect(() => {
    setTimeout(() => confirmEmail({ confirmationToken }), 1000)
  }, [confirmEmail, confirmationToken])

  if (mutation.isIdle || mutation.isLoading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner caption="Confirming your email" />
      </div>
    )
  }

  if (mutation.isSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.description}>{t('devise.confirmations.confirmed')}</div>
        <Link to="/" className={styles.primaryButton}>
          {t('devise.registrations.back_to_main_page')}
        </Link>
      </div>
    )
  }

  if (mutation.isError) {
    const errors = Object.values(
      mutation.error?.response?.data?.errors || { base: 'Unknown error ' }
    ).flat()

    return (
      <div className={styles.container}>
        <ul className={styles.serverError}>
          {errors.map(error => (
            <li key={error}>{error}</li>
          ))}
        </ul>

        <Link to="/users/resend-confirmation" className={styles.secondaryButton}>
          {t('devise.confirmations.new.resend_confirmation_instructions')}
        </Link>

        <Link to="/" className={styles.secondaryButton}>
          {t('devise.registrations.back_to_main_page')}
        </Link>
      </div>
    )
  }

  return null
}

export default EmailConfirmation
