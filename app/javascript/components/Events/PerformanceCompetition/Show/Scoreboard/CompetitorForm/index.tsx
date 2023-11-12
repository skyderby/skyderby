import React from 'react'
import { Formik, Field, FieldProps, FormikHelpers } from 'formik'
import toast from 'react-hot-toast'
import type { ValueType } from 'react-select'
import type { UseMutationResult } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import { CompetitorVariables } from 'api/performanceCompetitions'
import Modal from 'components/ui/Modal'
import { useI18n } from 'components/TranslationsProvider'
import ProfileSelect from 'components/ProfileSelect'
import CountrySelect from 'components/CountrySelect'
import SuitSelect from 'components/SuitSelect'
import RequestErrorToast from 'components/RequestErrorToast'
import CategorySelect from './CategorySelect'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'

type FormData = {
  profileId: null | number
  profileAttributes: {
    name: string
    countryId: null | number
  }
  suitId: null | number
  categoryId: null | number
  assignedNumber: null | number
  newProfile: 'true' | 'false'
}

type CompetitorFormProps = {
  eventId: number
  mutation: UseMutationResult<
    unknown,
    AxiosError<Record<string, string[]>>,
    CompetitorVariables
  >
  onHide: () => void
  initialValues?: Partial<FormData>
}

const defaultInitialValues: FormData = {
  profileId: null,
  profileAttributes: {
    name: '',
    countryId: null
  },
  suitId: null,
  categoryId: null,
  assignedNumber: null,
  newProfile: 'false'
}

const CompetitorForm = ({
  eventId,
  initialValues,
  mutation,
  onHide: hide
}: CompetitorFormProps) => {
  const { t } = useI18n()

  const handleSubmit = async (values: FormData, formikBag: FormikHelpers<FormData>) => {
    const { newProfile, profileId, profileAttributes, ...params } = values
    const competitorParams = {
      eventId,
      ...params,
      ...(newProfile === 'true' ? { profileAttributes } : { profileId })
    }

    mutation.mutate(competitorParams, {
      onSuccess: hide,
      onSettled: () => formikBag.setSubmitting(false),
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })
  }

  const formValues = Object.assign({}, defaultInitialValues, initialValues)

  return (
    <Modal isShown={true} onHide={hide} title="New competitor" size="sm">
      <Formik
        initialValues={formValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, isSubmitting, touched, errors }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className={styles.inputGroup}>
                <label className={styles.radioInput}>
                  <Field type="radio" name="newProfile" value="false" />
                  <span>{t('competitors.form.select_profile')}</span>
                </label>
                <Field name="profileId">
                  {({
                    field: { name, ...props },
                    form: { setFieldValue },
                    meta: { touched, error }
                  }: FieldProps) => (
                    <>
                      <ProfileSelect
                        isInvalid={touched && error}
                        {...props}
                        menuPortalTarget={document.getElementById('dropdowns-root')}
                        onChange={(option: ValueType<{ value: number }, false>) => {
                          if (option === null) {
                            setFieldValue(name, null)
                          } else {
                            setFieldValue(name, option.value)
                          }
                        }}
                      />
                    </>
                  )}
                </Field>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.radioInput}>
                  <Field type="radio" name="newProfile" value="true" />
                  <span>{t('competitors.form.create_profile')}</span>
                </label>
                <div className={styles.newProfileGroup}>
                  <label>{t('activerecord.attributes.profile.name')}</label>
                  <Field
                    name="profileAttributes[name]"
                    data-invalid={
                      errors?.profileAttributes?.name && touched?.profileAttributes?.name
                    }
                    className={styles.input}
                  />

                  <label>{t('activerecord.attributes.profile.country')}</label>
                  <Field name="profileAttributes[countryId]">
                    {({
                      field: { name, ...props },
                      form: { setFieldValue },
                      meta: { touched, error }
                    }: FieldProps) => (
                      <CountrySelect
                        isInvalid={touched && error}
                        {...props}
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
                </div>
              </div>

              <hr />

              <div className={styles.inputGroup}>
                <label htmlFor="assignedValue">
                  {t('activerecord.attributes.event/competitor.assigned_number')}
                </label>
                <Field
                  name="assignedNumber"
                  id="assignedValue"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>{t('activerecord.attributes.event/competitor.suit')}</label>
                <Field name="suitId">
                  {({
                    field: { name, ...props },
                    form: { setFieldValue },
                    meta: { touched, error }
                  }: FieldProps) => (
                    <>
                      <SuitSelect
                        isInvalid={touched && error}
                        {...props}
                        menuPortalTarget={document.getElementById('dropdowns-root')}
                        onChange={(option: ValueType<{ value: number }, false>) => {
                          if (option === null) {
                            setFieldValue(name, null)
                          } else {
                            setFieldValue(name, option.value)
                          }
                        }}
                      />
                    </>
                  )}
                </Field>
              </div>

              <div className={styles.inputGroup}>
                <label>{t('activerecord.attributes.event/competitor.section')}</label>
                <Field name="categoryId">
                  {({
                    field: { name, ...props },
                    form: { setFieldValue },
                    meta: { touched, error }
                  }: FieldProps) => (
                    <>
                      <CategorySelect
                        isInvalid={touched && error}
                        eventId={eventId}
                        {...props}
                        menuPortalTarget={document.getElementById('dropdowns-root')}
                        onChange={(option: ValueType<{ value: number }, false>) => {
                          if (option === null) {
                            setFieldValue(name, null)
                          } else {
                            setFieldValue(name, option.value)
                          }
                        }}
                      />
                    </>
                  )}
                </Field>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isSubmitting}
              >
                {t('general.save')}
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={isSubmitting}
                data-dismiss="modal"
                onClick={hide}
              >
                {t('general.cancel')}
              </button>
            </Modal.Footer>
          </form>
        )}
      </Formik>
    </Modal>
  )
}

export default CompetitorForm
