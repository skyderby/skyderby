import React from 'react'
import { Link } from 'react-router-dom'
import { Field, Formik, FormikHelpers } from 'formik'
import axios from 'axios'

import { SignUpForm, ServerErrors, SignUpMutation } from 'api/hooks/users'
import { useI18n } from 'components/TranslationsProvider'
import styles from 'components/Users/styles.module.scss'
import Separator from 'components/Users/Separator'
import validationSchema from './validationSchema'

interface FormValues extends SignUpForm {
  serverError?: never
}

type FormProps = {
  mutation: SignUpMutation
}

const emptyErrors: ServerErrors = { errors: {} }

const initialValues = {
  email: '',
  password: '',
  passwordConfirmation: '',
  profileAttributes: { name: '' }
}

const Form = ({ mutation }: FormProps): JSX.Element => {
  const { t } = useI18n()

  const handleSubmit = async (
    values: FormValues,
    formikBag: FormikHelpers<FormValues>
  ) => {
    try {
      await mutation.mutateAsync(values)
    } catch (err) {
      formikBag.setSubmitting(false)

      if (axios.isAxiosError(err)) {
        const {
          errors: { name, email, password, ...rest }
        } = err.response?.data ?? emptyErrors

        if (name) formikBag.setFieldError('name', name.join(', '))
        if (email) formikBag.setFieldError('email', email.join(', '))
        if (password) formikBag.setFieldError('password', password.join(', '))
        if (rest)
          formikBag.setFieldError('serverError', Object.values(rest).flat().join(', '))
      } else {
        formikBag.setFieldError('serverError', String(err))
      }
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
          {errors.serverError && (
            <p className={styles.serverError}>{errors.serverError}</p>
          )}

          <div>
            <Field
              autoFocus
              name="profileAttributes[name]"
              className={styles.input}
              placeholder="Full name"
              autoComplete="name"
              data-invalid={
                errors.profileAttributes?.name && touched.profileAttributes?.name
              }
            />
            {errors.profileAttributes?.name && touched.profileAttributes?.name && (
              <span className={styles.error}>{errors.profileAttributes.name}</span>
            )}
          </div>

          <div>
            <Field
              name="email"
              className={styles.input}
              placeholder="Email"
              autoComplete="email"
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

          <a href="/users/auth/facebook" className={styles.secondaryButton}>
            {t('devise.shared.links.sign_in_with_provider', { provider: 'Facebook' })}
          </a>

          <Separator>{t('general.or')}</Separator>

          <Link to="/users/sign-in" className={styles.secondaryButton}>
            {t('devise.shared.links.sign_in')}
          </Link>

          <Link to="/users/email-confirmation" className={styles.tertiaryButton}>
            {t('devise.shared.links.didn_t_receive_confirmation_instructions')}
          </Link>
        </form>
      )}
    </Formik>
  )
}

export default Form
