import React from 'react'
import { Formik, Field } from 'formik'

import validationSchema from './validationSchema'
import styles from 'components/Users/styles.module.scss'
import Separator from 'components/Users/Separator'
import { Link } from 'react-router-dom'
import { useI18n } from 'components/TranslationsProvider'

const initialValues = { email: '' }

const ForgotPassword = (): JSX.Element => {
  const { t } = useI18n()
  const handleSubmit = console.log
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ touched, errors, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit} className={styles.container}>
          <h2 className={styles.title}>
            {t('devise.shared.links.forgot_your_password')}
          </h2>
          <div>
            <Field
              autoFocus
              name="email"
              className={styles.input}
              placeholder="Email"
              autoComplete="username"
              data-invalid={errors.email && touched.email}
            />
            {errors.email && touched.email && (
              <span className={styles.error}>{errors.email}</span>
            )}
          </div>

          <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
            {t('devise.passwords.new.send_me_reset_password_instructions')}
          </button>

          <Separator>{t('general.or')}</Separator>

          <Link to="/users/sign-in" className={styles.secondaryButton}>
            {t('devise.shared.links.sign_in')}
          </Link>
        </form>
      )}
    </Formik>
  )
}

export default ForgotPassword
