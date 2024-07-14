import React from 'react'
import { OnChangeValue } from 'react-select'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { Formik, Field, FormikHelpers, FieldProps } from 'formik'
import { UseMutationResult } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import toast from 'react-hot-toast'
import Modal from 'components/ui/Modal'
import { useI18n } from 'components/TranslationsProvider'
import ProfileSelect from 'components/ProfileSelect'
import CountrySelect from 'components/CountrySelect'
import SuitSelect from 'components/SuitSelect'
import RequestErrorToast from 'components/RequestErrorToast'
import { Competitor, CompetitorVariables } from 'api/tournaments'
import styles from './styles.module.scss'

interface CompetitorData {
  profileId: number | null
  profileAttributes: {
    name: string
    countryId: number | null
  }
  suitId: null | number
}

interface FormData extends CompetitorData {
  newProfile: 'true' | 'false'
}

const defaultInitialValues: FormData = {
  profileId: null,
  profileAttributes: {
    name: '',
    countryId: null
  },
  suitId: null,
  newProfile: 'false'
}

type Props = {
  initialValues?: Partial<Competitor>
  id?: number
  mutation: UseMutationResult<
    unknown,
    AxiosError<Record<string, string[]>>,
    { id: number | undefined; competitor: CompetitorVariables }
  >
}

const Form = NiceModal.create(({ initialValues, id, mutation }: Props) => {
  const { t } = useI18n()
  const modal = useModal()

  const handleSubmit = async (values: FormData, formikBag: FormikHelpers<FormData>) => {
    const { newProfile, profileId, profileAttributes, ...params } = values
    const competitor = {
      ...params,
      ...(newProfile === 'true'
        ? { profileAttributes, profileId: null }
        : { profileId, profileAttributes: null })
    }

    mutation.mutate(
      { id, competitor },
      {
        onSuccess: () => modal.remove(),
        onSettled: () => formikBag.setSubmitting(false),
        onError: error => {
          toast.error(<RequestErrorToast response={error.response} />)
        }
      }
    )
  }

  return (
    <Modal isShown={modal.visible} title="Competitor" size="sm" onHide={modal.remove}>
      <Formik
        initialValues={{ ...defaultInitialValues, ...initialValues }}
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
                        onChange={(option: OnChangeValue<{ value: number }, false>) => {
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
                        onChange={option => {
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
                        onChange={option => {
                          console.log(option)
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
                onClick={modal.remove}
              >
                {t('general.cancel')}
              </button>
            </Modal.Footer>
          </form>
        )}
      </Formik>
    </Modal>
  )
})

export default Form
