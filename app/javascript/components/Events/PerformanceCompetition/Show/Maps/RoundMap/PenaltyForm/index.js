import React from 'react'
import { Formik, Field } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import { updatePenalty } from 'redux/events/round'
import Modal from 'components/ui/Modal'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'

import styles from './styles.module.scss'

const PenaltyForm = ({ isShown, title, resultId, onModalHide }) => {
  const { t } = useI18n()
  const dispatch = useDispatch()
  const { penalized, penaltySize, penaltyReason } = useSelector(state =>
    state.eventRound.results.find(({ id }) => id === resultId)
  )

  const initialValues = {
    penalized: penalized || false,
    penaltySize: penaltySize || 0,
    penaltyReason: penaltyReason || ''
  }

  const handleSubmit = values => {
    dispatch(updatePenalty(resultId, values)).then(onModalHide)
  }

  const penaltyOptions = ['10', '20', '50', '100'].map(value => ({
    value,
    label: `${value} %`
  }))

  return (
    <Modal isShown={isShown} onHide={onModalHide} size="sm" title={title}>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body className={styles.modalBody}>
              <label className={styles.label} htmlFor="penalized">
                Apply penalty
              </label>
              <Field name="penalized" type="checkbox" />

              <label className={styles.label}>Deduction</label>
              <Field as={RadioButtonGroup} name="penaltySize" options={penaltyOptions} />

              <label className={styles.label} htmlFor="penaltyReason">
                Reason
              </label>
              <Field className={styles.input} name="penaltyReason" />
            </Modal.Body>

            <Modal.Footer>
              <button className={styles.primaryButton} type="submit">
                {t('general.save')}
              </button>
              <button className={styles.secondaryButton} onClick={onModalHide}>
                {t('general.cancel')}
              </button>
            </Modal.Footer>
          </form>
        )}
      </Formik>
    </Modal>
  )
}

PenaltyForm.propTypes = {
  isShown: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  resultId: PropTypes.number.isRequired,
  onModalHide: PropTypes.func.isRequired
}

export default PenaltyForm
