'use client'

import React from 'react'
import { useRouter, redirect } from 'next/navigation'
import Link from 'next/link'
import { Field, Formik, FormikHelpers } from 'formik'

import Separator from 'components/Separator'
import validationSchema from './validationSchema'
import styles from '../styles.module.scss'

interface FormValues {
  email: string
  password: string
}

const initialValues = { email: '', password: '' }

type Props = {
  onSubmit: (
    values: FormValues
  ) => Promise<{ status: 'success' } | { status: 'error'; error: string }>
  serverErrors: string | null
}

const Form = ({ onSubmit, serverErrors }: Props) => {
  const t = (txt: string, ...rest) => txt
  const router = useRouter()
  const handleSubmit = async (
    values: FormValues,
    formikBag: FormikHelpers<FormValues>
  ): Promise<void> => {
    const response = await onSubmit(values)
    if (response.status === 'success') {
      router.push('/')
    } else {
      formikBag.setFieldError('serverError', response.error)
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ touched, errors, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit} className={styles.container}>
          {serverErrors && <p className={styles.serverError}>{serverErrors}</p>}

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

          <Link href="/users/forgot-password" className={styles.link}>
            {t('devise.shared.links.forgot_your_password')}
          </Link>

          <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
            {t('devise.sessions.new.sign_in')}
          </button>

          <Separator>{t('general.or')}</Separator>

          <Link href="/users/sign-up" className={styles.secondaryButton}>
            {t('devise.shared.links.sign_up')}
          </Link>

          <a href="/users/auth/facebook" className={styles.secondaryButton}>
            {t('devise.shared.links.sign_in_with_provider', { provider: 'Facebook' })}
          </a>
        </form>
      )}
    </Formik>
  )
}

export default Form
