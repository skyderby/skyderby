import React from 'react'
import { AxiosError, AxiosResponse } from 'axios'
import { UseMutationResult } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Formik, Field, ErrorMessage, FieldProps, FormikHelpers } from 'formik'
import { ValueType } from 'react-select'
import toast from 'react-hot-toast'

import { PerformanceCompetitionVariables } from 'api/performanceCompetitions'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import PlaceSelect from 'components/PlaceSelect'
import { useI18n } from 'components/TranslationsProvider'
import RequestErrorToast from 'components/RequestErrorToast'
import ErrorText from 'components/ui/ErrorMessage'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'

type FormProps = {
  initialValues: PerformanceCompetitionVariables
  mutation: UseMutationResult<
    AxiosResponse<{ id: number }>,
    AxiosError<Record<string, string[]>>,
    PerformanceCompetitionVariables
  >
  returnUrl: string
}

const Form = ({ initialValues, mutation, returnUrl }: FormProps) => {
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleSubmit = (
    values: PerformanceCompetitionVariables,
    formikBag: FormikHelpers<PerformanceCompetitionVariables>
  ) => {
    mutation.mutate(values, {
      onSuccess: response => navigate(`/events/performance/${response.data.id}`),
      onSettled: () => formikBag.setSubmitting(false),
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <label>{t('activerecord.attributes.event.name')}</label>
            <div>
              <Field name="name" className={styles.input} />
              <ErrorMessage name="name" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.event.starts_at')}</label>
            <div>
              <Field type="date" name="startsAt" className={styles.input} />
              <ErrorMessage name="startsAt" component={ErrorText} />
            </div>

            <label>{t('events.show.comp_window')}</label>
            <div className={styles.competitionWindow}>
              <Field type="number" name="rangeFrom" min="0" className={styles.input} />
              <span>&mdash;</span>
              <Field type="number" name="rangeTo" min="0" className={styles.input} />
            </div>

            <label>{t('activerecord.attributes.event.place')}</label>
            <div>
              <Field name="placeId">
                {({ field: { name, ...props }, form: { setFieldValue } }: FieldProps) => (
                  <PlaceSelect
                    {...props}
                    aria-label="Select place"
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
              <ErrorMessage name="placeId" component={ErrorText} />
            </div>

            <label>{t('activerecord.attributes.event.visibility')}</label>
            <Field
              as={RadioButtonGroup}
              name="visibility"
              options={[
                {
                  value: 'public_event',
                  label: t('activerecord.attributes.event.visibilities.public_event')
                },
                {
                  value: 'unlisted_event',
                  label: t('activerecord.attributes.event.visibilities.unlisted_event')
                },
                {
                  value: 'private_event',
                  label: t('activerecord.attributes.event.visibilities.private_event')
                }
              ]}
            />

            <label>{t('activerecord.attributes.event.use_teams')}</label>
            <Field
              as={RadioButtonGroup}
              name="useTeams"
              options={[
                { value: 'false', label: t('general.disabled') },
                { value: 'true', label: t('general.enabled') }
              ]}
            />
          </div>

          <div className={styles.footer}>
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
