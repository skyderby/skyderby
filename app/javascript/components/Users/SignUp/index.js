import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Formik, Field } from 'formik'

import Api from 'api'
import PageWrapper from 'components/Users/PageWrapper'
import Separator from 'components/Users/Separator'
import { useI18n } from 'components/TranslationsProvider'
import validationSchema from './validationSchema'
import styles from 'components/Users/styles.module.scss'

const SignUp = () => {
  const { t } = useI18n()
  const history = useHistory()
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await Api.Registration.create(values)
      history.push('/users/success-registration')
    } catch (err) {
      setSubmitting(false)

      if (err.response?.data?.errors) {
        const { errors: { email, password, ...rest } = {} } = err.response.data

        if (email) setFieldError('email', email.join(', '))
        if (password) setFieldError('email', password.join(', '))
        if (rest) setFieldError('serverError', Object.values(rest).flat().join(', '))
      } else {
        setFieldError('serverError', err.toString())
      }
    }
  }

  return (
    <PageWrapper>
      <Formik
        initialValues={{ email: '', password: '', passwordConfirmation: '' }}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ touched, errors, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit} className={styles.container}>
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

            <div>
              <Field
                name="password"
                className={styles.input}
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                data-invalid={errors.password && touched.password}
              />
              {errors.password && touched.password && (
                <span className={styles.error}>{errors.password}</span>
              )}
            </div>

            <div>
              <Field
                name="passwordConfirmation"
                className={styles.input}
                type="password"
                placeholder="Password confirmation"
                autoComplete="new-password"
                data-invalid={errors.passwordConfirmation && touched.passwordConfirmation}
              />
              {errors.passwordConfirmation && touched.passwordConfirmation && (
                <span className={styles.error}>{errors.passwordConfirmation}</span>
              )}
            </div>

            <button className={styles.primaryButton} disabled={isSubmitting}>
              {t('devise.registrations.new.sign_up')}
            </button>

            <a
              href="/users/auth/facebook"
              className={styles.secondaryButton}
              disabled={isSubmitting}
            >
              {t('devise.shared.links.sign_in_with_provider', { provider: 'Facebook' })}
            </a>

            <Separator>{t('general.or')}</Separator>
            <Link
              to="/users/sign-in"
              className={styles.secondaryButton}
              disabled={isSubmitting}
            >
              {t('devise.shared.links.sign_in')}
            </Link>

            <Link to="/users/email-confirmation" className={styles.tertiaryButton}>
              {t('devise.shared.links.didn_t_receive_confirmation_instructions')}
            </Link>
          </form>
        )}
      </Formik>
    </PageWrapper>
  )
}

export default SignUp
