import React from 'react'
import { Formik, Field, ErrorMessage, FieldProps, FormikHelpers } from 'formik'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { ValueType } from 'react-select'
import type { UseMutationResult } from 'react-query'
import type { AxiosError, AxiosResponse } from 'axios'

import { PlaceRecord, PlaceVariables } from 'api/places'
import ErrorText from 'components/ui/ErrorMessage'
import { useI18n } from 'components/TranslationsProvider'
import CountrySelect from 'components/CountrySelect'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'
import RequestErrorToast from 'components/RequestErrorToast'

type FormProps = {
  initialValues: PlaceVariables
  mutation: UseMutationResult<
    AxiosResponse<PlaceRecord>,
    AxiosError<Record<string, string[]>>,
    PlaceVariables
  >
  deleteMutation?: UseMutationResult<
    AxiosResponse<PlaceRecord>,
    AxiosError<Record<string, string[]>>,
    void
  >
  returnUrl: string
}

const Form = ({
  initialValues,
  mutation,
  deleteMutation,
  returnUrl
}: FormProps): JSX.Element => {
  const { t } = useI18n()
  const navigate = useNavigate()

  const deletable = deleteMutation !== undefined

  const handleSubmit = (values: PlaceVariables, helpers: FormikHelpers<PlaceVariables>) =>
    mutation.mutate(values, {
      onSuccess: response => navigate(`/places/${response.data.id}`),
      onSettled: () => helpers.setSubmitting(false)
    })

  const handleDelete = () =>
    deleteMutation &&
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/places')
        toast.success('Place had been successfully deleted.')
      },
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <label>{t('activerecord.attributes.place.name')}</label>
            <div>
              <Field name="name" className={styles.input} />
              <ErrorMessage name="name" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.place.kind')}</label>
            <Field
              as={RadioButtonGroup}
              name="kind"
              options={[
                {
                  value: 'skydive',
                  label: t('activerecord.attributes.place.kinds.skydive')
                },
                {
                  value: 'base',
                  label: t('activerecord.attributes.place.kinds.base')
                }
              ]}
            />

            <label>{t('activerecord.attributes.place.country')}</label>
            <div>
              <Field name="countryId">
                {({
                  field: { name, ...props },
                  form: { setFieldValue }
                }: FieldProps): JSX.Element => (
                  <CountrySelect
                    {...props}
                    placeholder={t('views.places.placeholder')}
                    aria-label="Select country"
                    onChange={(option: ValueType<{ value: number }, false>) => {
                      if (option === null) {
                        setFieldValue(name, null)
                      } else {
                        setFieldValue(name, option.value)
                      }
                    }}
                  />
                )}
              </Field>
              <ErrorMessage name="countryId" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.place.latitude')}</label>
            <div>
              <Field name="latitude" className={styles.input} />
              <ErrorMessage name="latitude" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.place.longitude')}</label>
            <div>
              <Field name="longitude" className={styles.input} />
              <ErrorMessage name="longitude" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.place.msl')}</label>
            <div>
              <Field name="msl" className={styles.input} />
              <ErrorMessage name="msl" component={ErrorText} />
            </div>
          </div>

          <div className={styles.footer}>
            {deletable && (
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
              >
                {t('general.delete')}
              </button>
            )}
            <button type="submit" className={styles.primaryButton}>
              {t('general.save')}
            </button>
            <Link to={returnUrl} className={styles.secondaryButton}>
              {t('general.cancel')}
            </Link>
          </div>
        </form>
      )}
    </Formik>
  )
}

export default Form
