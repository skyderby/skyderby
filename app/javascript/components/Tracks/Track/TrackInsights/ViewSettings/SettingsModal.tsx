import React from 'react'
import { Formik, Field } from 'formik'

import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import Select from './Select'
import {
  IMPERIAL,
  METRIC,
  SEPARATE_CHARTS,
  SINGLE_CHART,
  ViewPreferences
} from 'components/TrackViewPreferences'
import styles from './styles.module.scss'

type SettingsModalProps = {
  onSubmit: (values: ViewPreferences) => void
  formValues: ViewPreferences
  isShown: boolean
  onHide: () => void
}

type ChartModeOption = {
  value: ViewPreferences['chartMode']
  label: string
}

type UnitSystemOption = {
  value: ViewPreferences['unitSystem']
  label: string
}

const SettingsModal = ({
  onSubmit,
  formValues,
  isShown,
  onHide: handleHide
}: SettingsModalProps): JSX.Element => {
  const { t } = useI18n()

  const chartModeOptions = [
    {
      value: SEPARATE_CHARTS,
      label: t('tracks.show.menu_sep')
    },
    {
      value: SINGLE_CHART,
      label: t('tracks.show.menu_one')
    }
  ]

  const unitSystemOptions = [
    {
      value: METRIC,
      label: t('tracks.show.m_units_metric')
    },
    {
      value: IMPERIAL,
      label: t('tracks.show.m_units_imperial')
    }
  ]

  return (
    <Modal isShown={isShown} onHide={handleHide} title="View preferences">
      <Formik initialValues={formValues} onSubmit={onSubmit}>
        {({ values, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className={styles.formGroup}>
                <label htmlFor="chartMode">{t('tracks.show.menu_header')}</label>
                <Field
                  as={Select}
                  name="chartMode"
                  inputId="chartMode"
                  value={values.chartMode}
                  options={chartModeOptions}
                  onChange={(option: ChartModeOption) => {
                    if (!option) return
                    setFieldValue('chartMode', option.value)
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="unitSystem">{t('tracks.show.units_header')}</label>
                <Field
                  as={Select}
                  name="unitSystem"
                  inputId="unitSystem"
                  value={values.unitSystem}
                  options={unitSystemOptions}
                  onChange={(option: UnitSystemOption) => {
                    if (!option) return
                    setFieldValue('unitSystem', option.value)
                  }}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button className={styles.primaryButton} type="submit">
                {t('general.save')}
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={handleHide}
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

export default SettingsModal
