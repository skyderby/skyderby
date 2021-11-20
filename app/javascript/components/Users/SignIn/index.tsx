import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Location } from 'history'
import { Formik, Field, FormikHelpers } from 'formik'

import { useLoginMutation } from 'api/sessions'
import Layout from 'components/Users/Layout'
import Separator from 'components/Users/Separator'
import { useI18n } from 'components/TranslationsProvider'
import validationSchema from './validationSchema'
import styles from 'components/Users/styles.module.scss'

type SignInProps = {
  location: Location<{ returnTo?: string }>
}

interface FormValues {
  email: string
  password: string
}

const initialValues = { email: '', password: '' }

const SignIn = ({ location }: SignInProps): JSX.Element => {
  const history = useHistory()
  const { t } = useI18n()
  const loginMutation = useLoginMutation()

  const returnTo = location.state?.returnTo ?? '/'

  const handleSubmit = async (
    values: FormValues,
    formikBag: FormikHelpers<FormValues>
  ): Promise<void> => {
    try {
      await loginMutation.mutateAsync(values)
      history.push(returnTo)
    } catch (err) {
      formikBag.setSubmitting(false)
    }
  }

  return (
    <Layout>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ touched, errors, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit} className={styles.container}>
            {loginMutation.error && (
              <p className={styles.serverError}>
                {loginMutation.error.response?.data?.error || loginMutation.error.message}
              </p>
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
                autoComplete="current-password"
                data-invalid={errors.password && touched.password}
              />
              {errors.password && touched.password && (
                <span className={styles.error}>{errors.password}</span>
              )}
            </div>

            <Link to="/forgot-password" className={styles.link}>
              {t('devise.shared.links.forgot_your_password')}
            </Link>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmitting}
            >
              {t('devise.sessions.new.sign_in')}
            </button>

            <Separator>{t('general.or')}</Separator>

            <Link to="/users/sign-up" className={styles.secondaryButton}>
              {t('devise.shared.links.sign_up')}
            </Link>

            <a href="/users/auth/facebook" className={styles.secondaryButton}>
              {t('devise.shared.links.sign_in_with_provider', { provider: 'Facebook' })}
            </a>
          </form>
        )}
      </Formik>
    </Layout>
  )
}

export default SignIn
