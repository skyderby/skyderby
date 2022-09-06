import React from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Field, Formik, FormikHelpers } from 'formik'

import { useCreatePasswordMutation } from 'api/users'
import { useI18n } from 'components/TranslationsProvider'
import validationSchema from './validationSchema'
import styles from 'components/Users/styles.module.scss'

interface FormValues {
  password: string
  passwordConfirmation: string
  serverError?: never
}

const initialValues = { password: '', passwordConfirmation: '' }

const NewPassword = () => {
  const { t } = useI18n()
  const [params] = useSearchParams()
  const resetPasswordToken = params.get('reset_password_token') ?? ''
  const mutation = useCreatePasswordMutation()

  const handleSubmit = (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
    mutation.mutate(
      { ...values, resetPasswordToken },
      {
        onSettled: () => formikHelpers.setSubmitting(false),
        onSuccess: () => {
          toast.success(t('devise.passwords.updated'))
        },
        onError: err => {
          const { password, ...serverErrors } = err.response?.data?.errors || {}
          if (password) formikHelpers.setFieldError('password', password.join(', '))
          if (serverErrors)
            formikHelpers.setFieldError(
              'serverError',
              Object.values(serverErrors).flat().join(', ')
            )
        }
      }
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
            {t('devise.passwords.edit.change_your_password')}
          </h2>

          {errors.serverError && (
            <p className={styles.serverError}>{errors.serverError}</p>
          )}

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
          <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
            {t('devise.passwords.edit.change_your_password')}
          </button>
        </form>
      )}
    </Formik>
  )
}

export default NewPassword
