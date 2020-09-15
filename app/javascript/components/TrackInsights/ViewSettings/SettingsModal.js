import React from 'react'
import { Formik, Field } from 'formik'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import Button from 'components/ui/Button'
import { SINGLE_CHART, MULTI_CHART } from 'redux/userPreferences/chartMode'
import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import Select from './Select'
import { FormBody, FormGroup, Label, Footer } from './elements'

const SettingsModal = ({ onSubmit, formValues, isShown, onHide: handleHide }) => {
  const { t } = useI18n()

  const chartModeOptions = [
    {
      value: MULTI_CHART,
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
            <FormBody>
              <FormGroup>
                <Label htmlFor="chartMode">{t('tracks.show.menu_header')}</Label>
                <Field
                  as={Select}
                  name="chartMode"
                  id="chartMode"
                  value={values.chartMode}
                  options={chartModeOptions}
                  onChange={({ value }) => setFieldValue('chartMode', value)}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="unitSystem">{t('tracks.show.units_header')}</Label>
                <Field
                  as={Select}
                  name="unitSystem"
                  id="unitSystem"
                  value={values.unitSystem}
                  options={unitSystemOptions}
                  onChange={({ value }) => setFieldValue('unitSystem', value)}
                />
              </FormGroup>
            </FormBody>
            <Footer>
              <Button type="submit">{t('general.save')}</Button>
              <Button type="button" onClick={handleHide}>
                {t('general.cancel')}
              </Button>
            </Footer>
          </form>
        )}
      </Formik>
    </Modal>
  )
}

SettingsModal.propTypes = {
  formValues: PropTypes.shape({
    chartMode: PropTypes.string.isRequired,
    unitSystem: PropTypes.string.isRequired
  }).isRequired,
  isShown: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default SettingsModal
