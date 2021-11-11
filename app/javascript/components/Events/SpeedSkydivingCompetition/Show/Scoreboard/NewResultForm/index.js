import React from 'react'
import PropTypes from 'prop-types'
import { Formik, Field, ErrorMessage } from 'formik'

import { useCompetitorQuery, useRoundQuery } from 'api/speedSkydivingCompetitions'
import { useProfileQuery } from 'api/profiles'
import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import FileInput from 'components/ui/FileInput'
import TrackSelect from 'components/TrackSelect'
import ErrorText from 'components/ui/ErrorMessage'
import validationSchema from './validationSchema'
import styles from './styles.module.scss'

const initialValues = {
  trackFrom: 'from_file',
  trackId: null,
  trackFile: null
}

const NewResultForm = ({ mutation, event, roundId, competitorId, onHide: hide }) => {
  const { t } = useI18n()
  const { data: competitor } = useCompetitorQuery(event.id, competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: round } = useRoundQuery(event.id, roundId)

  const saveResult = async (values, formikBag) => {
    try {
      await mutation.mutateAsync({
        ...values,
        eventId: event.id,
        competitorId: competitor.id,
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
                  {mutation.error.response.data?.error ?? mutation.error.message}
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
                  }) => (
                    <FileInput
                      isInvalid={touched && error}
                      accept=".csv"
                      {...props}
                      onChange={evt => setFieldValue(name, evt.currentTarget.files[0])}
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
                  }) => (
                    <TrackSelect
                      isInvalid={touched && error}
                      filters={{ profileId: competitor.profileId }}
                      {...props}
                      onChange={option => setFieldValue(name, option.value)}
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

NewResultForm.propTypes = {
  mutation: PropTypes.shape({
    mutateAsync: PropTypes.func.isRequired,
    error: PropTypes.shape({
      message: PropTypes.string,
      response: PropTypes.any
    })
  }).isRequired,
  event: PropTypes.shape({
    id: PropTypes.number.isRequired
  }).isRequired,
  roundId: PropTypes.number.isRequired,
  competitorId: PropTypes.number.isRequired,
  onHide: PropTypes.func.isRequired
}

export default NewResultForm
