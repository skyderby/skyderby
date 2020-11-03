import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Formik, Field } from 'formik'
import { useDispatch } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'
import PropTypes from 'prop-types'

import { login } from 'redux/session'
import PageWrapper from 'components/Users/PageWrapper'
import { useI18n } from 'components/TranslationsProvider'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'

const SignIn = ({ afterLoginUrl }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { t } = useI18n()

  const handleSubmit = (values, formikBag) => {
    dispatch(login(values))
      .then(unwrapResult)
      .then(() => history.push(afterLoginUrl))
      .catch(err => {
        formikBag.setSubmitting(false)
        formikBag.setFieldError('serverError', err)
      })
  }

  return (
    <PageWrapper>
      <Formik
        initialValues={{ email: '', password: '' }}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ touched, errors, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit} className={styles.form}>
            {errors.serverError && (
              <p className={styles.serverError}>
                <strong>{errors.serverError.name}</strong>: {errors.serverError.message}
              </p>
            )}

            <div>
              <Field
                autoFocus
                name="email"
                className={styles.input}
                placeholder="Email"
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
                autoComplete="current-password"
                data-invalid={errors.password && touched.password}
              />
              {errors.password && touched.password && (
                <span className={styles.error}>{errors.password}</span>
              )}
            </div>

            <Link to="/forgot-password" className={styles.forgotPassword}>
              {t('devise.shared.links.forgot_your_password')}
            </Link>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmitting}
            >
              {t('devise.sessions.new.sign_in')}
            </button>

            <div className={styles.separator}>
              <div className={styles.separatorLine} />
              <span>{t('general.or')}</span>
              <div className={styles.separatorLine} />
            </div>

            <Link
              to="/sign-up"
              className={styles.secondaryButton}
              disabled={isSubmitting}
            >
              {t('devise.shared.links.sign_up')}
            </Link>

            <a
              href="/users/auth/facebook"
              className={styles.secondaryButton}
              disabled={isSubmitting}
            >
              {t('devise.shared.links.sign_in_with_provider', { provider: 'Facebook' })}
            </a>
          </form>
        )}
      </Formik>
    </PageWrapper>
  )
}

SignIn.propTypes = {
  afterLoginUrl: PropTypes.string.isRequired
}

export default SignIn
