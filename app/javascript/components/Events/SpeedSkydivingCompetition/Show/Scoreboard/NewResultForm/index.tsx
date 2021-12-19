import React from 'react'
import { Formik, Field, ErrorMessage, FieldProps, FormikHelpers } from 'formik'

import {
  SpeedSkydivingCompetition,
  useCompetitorQuery,
  useRoundQuery
} from 'api/speedSkydivingCompetitions'
import { useProfileQuery } from 'api/profiles'
import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import FileInput from 'components/ui/FileInput'
import TrackSelect from 'components/TrackSelect'
import ErrorText from 'components/ui/ErrorMessage'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'
import { ValueType } from 'react-select'
import {
  NewResultMutation,
  CreateVariables
} from 'api/speedSkydivingCompetitions/results'

type FormData = Omit<CreateVariables, 'eventId' | 'roundId' | 'competitorId'>

const initialValues: FormData = {
  trackFrom: 'from_file' as const,
  trackId: null,
  trackFile: null
}

type NewResultFormProps = {
  mutation: NewResultMutation
  event: SpeedSkydivingCompetition
  roundId: number
  competitorId: number
  onHide: () => unknown
}

const NewResultForm = ({
  mutation,
  event,
  roundId,
  competitorId,
  onHide: hide
}: NewResultFormProps): JSX.Element => {
  const { t } = useI18n()
  const { data: competitor } = useCompetitorQuery(event.id, competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: round } = useRoundQuery(event.id, roundId)

  const saveResult = async (values: FormData, formikBag: FormikHelpers<FormData>) => {
    try {
      await mutation.mutateAsync({
        ...values,
        eventId: event.id,
        competitorId: competitorId,
        roundId: roundId
      })
    } catch (err) {
      formikBag.setSubmitting(false)
    }
  }

  return (
    <Modal
      isShown={true}
      onHide={hide}
      title={`New result: ${profile?.name} - Round ${round?.number}`}
      size="sm"
    >
      <Formik
        initialValues={initialValues}
        onSubmit={saveResult}
        validationSchema={validationSchema}
      >
        {({ handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body>
              {mutation.error && (
                <p className={styles.serverError}>
                  {mutation.error.response?.data?.error ?? mutation.error.message}
                </p>
              )}
              <div className={styles.inputGroup}>
                <label className={styles.radioInput}>
                  <Field type="radio" name="trackFrom" value="from_file" />
                  <span>New track</span>
                </label>
                <Field name="trackFile">
                  {({
                    field: { name, value, ...props },
                    form: { setFieldValue },
                    meta: { touched, error }
                  }: FieldProps) => (
                    <FileInput
                      isInvalid={touched && error}
                      accept=".csv"
                      {...props}
                      onChange={event => {
                        const target = event.target as HTMLInputElement
                        const files = target.files
                        const file = files?.[0]

                        if (file) {
                          setFieldValue(name, file)
                        } else {
                          setFieldValue(name, null)
                        }
                      }}
                    />
                  )}
                </Field>
                <ErrorMessage name="trackFile" component={ErrorText} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.radioInput}>
                  <Field type="radio" name="trackFrom" value="existent" />
                  <span>Existing track</span>
                </label>
                <Field name="trackId">
                  {({
                    field: { name, ...props },
                    form: { setFieldValue },
                    meta: { touched, error }
                  }: FieldProps) => (
                    <TrackSelect
                      isInvalid={touched && error}
                      filters={{ profileId: competitor?.profileId }}
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
                <ErrorMessage name="trackId" component={ErrorText} />
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

export default NewResultForm
