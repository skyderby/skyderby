import React from 'react'
import { Formik, Field, FormikHelpers, FieldProps } from 'formik'
import toast from 'react-hot-toast'
import { ValueType } from 'react-select'

import Modal from 'components/ui/Modal'
import { useI18n } from 'components/TranslationsProvider'
import ProfileSelect from 'components/ProfileSelect'
import CountrySelect from 'components/CountrySelect'
import CategorySelect from './CategorySelect'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'
import {
  EditCompetitorMutation,
  NewCompetitorMutation
} from 'api/speedSkydivingCompetitions/competitors'
import RequestErrorToast from 'components/RequestErrorToast'

interface CompetitorData {
  profileId: number | null
  profileAttributes: {
    name: string
    countryId: number | null
  }
  categoryId: number | null
  assignedNumber: number | null
}

interface FormData extends CompetitorData {
  newProfile: 'true' | 'false'
}

type CompetitorFormProps = {
  eventId: number
  initialValues?: Partial<CompetitorData>
  mutation: NewCompetitorMutation | EditCompetitorMutation
  onHide: () => void
}

const defaultInitialValues: FormData = {
  profileId: null,
  profileAttributes: {
    name: '',
    countryId: null
  },
  categoryId: null,
  assignedNumber: null,
  newProfile: 'false'
}

const CompetitorForm = ({
  eventId,
  initialValues = {},
  mutation,
  onHide: hide
}: CompetitorFormProps): JSX.Element => {
  const { t } = useI18n()

  const handleSubmit = async (values: FormData, formikBag: FormikHelpers<FormData>) => {
    const { newProfile, profileId, profileAttributes, ...params } = values
    const competitorParams = {
      ...params,
      ...(newProfile === 'true'
        ? { profileAttributes, profileId: null }
        : { profileId, profileAttributes: null })
    }

    mutation.mutate(competitorParams, {
      onSuccess: () => hide(),
      onSettled: () => formikBag.setSubmitting(false),
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })
  }

  return (
    <Modal isShown={true} onHide={hide} title="New competitor" size="sm">
      <Formik
        initialValues={{ ...defaultInitialValues, ...initialValues }}
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
                  }: FieldProps): JSX.Element => (
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
                    }: FieldProps): JSX.Element => (
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
                <label>{t('activerecord.attributes.event/competitor.section')}</label>
                <Field name="categoryId">
                  {({
                    field: { name, ...props },
                    form: { setFieldValue },
                    meta: { touched, error }
                  }: FieldProps): JSX.Element => (
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
