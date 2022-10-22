import React, { useState } from 'react'
import { Field, Formik, FormikHelpers } from 'formik'
import { Link } from 'react-router-dom'
import { useResendConfirmationMutation } from 'api/users'
import { useI18n } from 'components/TranslationsProvider'
import Separator from 'components/Users/Separator'
import styles from 'components/Users/styles.module.scss'
import validationSchema from './validationSchema'

interface FormValues {
  email: string
  serverError?: never
}

const initialValues = { email: '' }

const ResendConfirmation = () => {
  const { t } = useI18n()
  const [submitted, setSubmitted] = useState(false)
  const resendConfirmationMutation = useResendConfirmationMutation()
  const handleSubmit = (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
    resendConfirmationMutation.mutate(values, {
      onSettled: () => formikHelpers.setSubmitting(false),
      onSuccess: () => setSubmitted(true),
      onError: err => {
        const { email, ...serverErrors } = err.response?.data?.errors || {}
        if (email) formikHelpers.setFieldError('email', email.join(', '))
        if (serverErrors)
          formikHelpers.setFieldError(
            'serverError',
            Object.values(serverErrors).flat().join(', ')
          )
      }
    })
  }

  if (submitted) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>
          {t('devise.confirmations.new.resend_confirmation_instructions')}
        </h2>
        <div className={styles.icon}>📬</div>
        <div className={styles.description}>
          {t('devise.confirmations.send_instructions')}
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
            {t('devise.confirmations.new.resend_confirmation_instructions')}
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
            {t('devise.confirmations.new.resend_confirmation_instructions')}
          </button>

          <Separator>{t('general.or')}</Separator>

          <Link to="/users/sign-up" className={styles.secondaryButton}>
            {t('devise.shared.links.sign_up')}
          </Link>
        </form>
      )}
    </Formik>
  )
}

export default ResendConfirmation
