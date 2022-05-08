import React from 'react'
import { Formik, Field } from 'formik'

import {
  PerformanceCompetition,
  Result,
  PenaltyVariables,
  useCompetitorQuery,
  useRoundQuery,
  useSetPenaltiesMutation
} from 'api/performanceCompetitions'
import { useProfileQuery } from 'api/profiles'
import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'

import styles from './styles.module.scss'
import toast from 'react-hot-toast'
import RequestErrorToast from 'components/RequestErrorToast'

type PenaltyFormProps = {
  event: PerformanceCompetition
  result: Result
  onModalHide: () => void
}

const PenaltyForm = ({ event, result, onModalHide: closeModal }: PenaltyFormProps) => {
  const { t } = useI18n()
  const { data: competitor } = useCompetitorQuery(event.id, result.competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: round } = useRoundQuery(event.id, result.roundId)
  const mutation = useSetPenaltiesMutation(event.id, result.id)
  const title = `${profile?.name} | ${t('disciplines.' + round?.task)} - ${round?.number}`

  const initialValues = {
    penalized: result.penalized || false,
    penaltySize: result.penaltySize || 0,
    penaltyReason: result.penaltyReason || ''
  }

  const handleSubmit = (values: PenaltyVariables) => {
    mutation.mutate(values, {
      onSuccess: () => closeModal(),
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })
  }

  const penaltyOptions = ['10', '20', '50', '100'].map(value => ({
    value,
    label: `${value} %`
  }))

  return (
    <Modal isShown onHide={closeModal} size="sm" title={title}>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body className={styles.modalBody}>
              <label className={styles.label} htmlFor="penalized">
                Apply penalty
              </label>
              <Field id="penalized" name="penalized" type="checkbox" />

              <label className={styles.label}>Deduction</label>
              <Field as={RadioButtonGroup} name="penaltySize" options={penaltyOptions} />

              <label className={styles.label} htmlFor="penaltyReason">
                Reason
              </label>
              <Field className={styles.input} id="penaltyReason" name="penaltyReason" />
            </Modal.Body>

            <Modal.Footer>
              <button className={styles.primaryButton} type="submit">
                {t('general.save')}
              </button>
              <button className={styles.secondaryButton} onClick={closeModal}>
                {t('general.cancel')}
              </button>
            </Modal.Footer>
          </form>
        )}
      </Formik>
    </Modal>
  )
}

export default PenaltyForm
