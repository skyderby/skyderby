import React from 'react'
import { Formik, Field } from 'formik'

import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import styles from './styles.module.scss'

type CustomRangeModalProps = {
  isShown: boolean
  onHide: () => void
  onChange: (range: readonly number[]) => void
  minAltitude: number
  maxAltitude: number
  selectedAltitudeRange: readonly number[]
}
const CustomRangeModal = ({
  isShown,
  onHide,
  onChange,
  minAltitude,
  maxAltitude,
  selectedAltitudeRange: [from, to]
}: CustomRangeModalProps): JSX.Element => {
  const { t } = useI18n()
  const handleSubmit = (values: { from: number; to: number }) =>
    onChange?.([values.from, values.to])

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
                className={styles.input}
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
                className={styles.input}
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

export default CustomRangeModal
