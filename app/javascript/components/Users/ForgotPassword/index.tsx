import React, { useState } from 'react'
import { Formik, Field, FormikHelpers } from 'formik'
import { Link } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import Separator from 'components/Users/Separator'
import { useResetPasswordMutation } from 'api/users'
import styles from 'components/Users/styles.module.scss'
import validationSchema from './validationSchema'

type FormValues = {
  email: string
  serverError?: never
}

const initialValues = { email: '' }

const ForgotPassword = () => {
  const { t } = useI18n()
  const [submitted, setSubmitted] = useState(false)
  const mutation = useResetPasswordMutation()
  const handleSubmit = (
    variables: FormValues,
    formikHelpers: FormikHelpers<FormValues>
  ) => {
    mutation.mutate(variables, {
      onSuccess: () => {
        setSubmitted(true)
      },
      onError: err => {
        const { email, ...serverErrors } = err.response?.data?.errors || {}
        if (email) formikHelpers.setFieldError('email', email.join(', '))
        if (serverErrors)
          formikHelpers.setFieldError(
            'serverError',
            Object.values(serverErrors).flat().join(', ')
          )
      },
      onSettled: () => {
        formikHelpers.setSubmitting(false)
      }
    })
  }

  if (submitted) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('devise.passwords.new.forgot_your_password')}</h2>
        <div className={styles.icon}>📬</div>
        <div className={styles.description}>
          {t('devise.passwords.send_instructions')}
        </div>
        <Link className={styles.primaryButton} to="/">
          {t('devise.registrations.back_to_main_page')}
        </Link>
      </div>
    )
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ touched, errors, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit} className={styles.container}>
          <h2 className={styles.title}>
            {t('devise.passwords.new.forgot_your_password')}
          </h2>
          {errors.serverError && (
            <p className={styles.serverError}>{errors.serverError}</p>
          )}
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
