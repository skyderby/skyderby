import React from 'react'
import { Formik, Field } from 'formik'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import Input from 'components/ui/Input'
import Modal from 'components/ui/Modal'

import styles from './styles.module.scss'

const CustomRangeModal = ({
  isShown,
  onHide,
  onChange,
  minAltitude,
  maxAltitude,
  selectedAltitudeRange: [from, to]
}) => {
  const { t } = useI18n()
  const handleSubmit = values => onChange?.([values.from, values.to])

  return (
    <Modal
      isShown={isShown}
      onHide={onHide}
      size="sm"
      title={t('tracks.show.edit_range')}
    >
      <Formik
        initialValues={{ from: Math.round(from), to: Math.round(to) }}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <div className={styles.fieldSet}>
              <label className={styles.label} htmlFor="rangeFrom">
                {t('tracks.show.range_from')}
              </label>
              <Field
                autoFocus
                as={Input}
                type="number"
                name="from"
                id="rangeFrom"
                min={Math.ceil(minAltitude)}
                max={Math.floor(maxAltitude)}
              />

              <label className={styles.label} htmlFor="rangeTo">
                {t('tracks.show.range_to')}
              </label>
              <Field
                as={Input}
                type="number"
                name="to"
                id="rangeTo"
                min={Math.ceil(minAltitude)}
                max={Math.floor(maxAltitude)}
              />
            </div>

            <Modal.Footer>
              <button className={styles.submitButton} type="submit">
                {t('general.save')}
              </button>
              <button className={styles.cancelButton} type="button" onClick={onHide}>
                {t('general.cancel')}
              </button>
            </Modal.Footer>
          </form>
        )}
      </Formik>
    </Modal>
  )
}

CustomRangeModal.propTypes = {
  minAltitude: PropTypes.number,
  maxAltitude: PropTypes.number,
  selectedAltitudeRange: PropTypes.arrayOf(PropTypes.number).isRequired,
  isShown: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onChange: PropTypes.func
}

export default CustomRangeModal
