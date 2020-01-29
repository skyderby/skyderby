import React from 'react'
import { Formik, Field } from 'formik'

import Modal from 'components/ui/Modal'
import Button from 'components/ui/Button'
import { SINGLE_CHART, MULTI_CHART } from 'redux/userPreferences/chartMode'
import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import Select from './Select'
import { FormBody, FormGroup, Label, Footer } from './elements'

const SettingsModal = ({ onSubmit, formValues, isShown, onHide: handleHide }) => {
  const chartModeOptions = [
    {
      value: MULTI_CHART,
      label: I18n.t('tracks.show.menu_sep')
    },
    {
      value: SINGLE_CHART,
      label: I18n.t('tracks.show.menu_one')
    }
  ]

  const unitSystemOptions = [
    {
      value: METRIC,
      label: I18n.t('tracks.show.m_units_metric')
    },
    {
      value: IMPERIAL,
      label: I18n.t('tracks.show.m_units_imperial')
    }
  ]

  return (
    <Modal isShown={isShown} onHide={handleHide} title="View preferences">
      <Formik
        initialValues={formValues}
        onSubmit={onSubmit}
        render={({ values, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <FormBody>
              <FormGroup>
                <Label>{I18n.t('tracks.show.menu_header')}</Label>
                <Field
                  as={Select}
                  value={values.chartMode}
                  options={chartModeOptions}
                  onChange={({ value }) => setFieldValue('chartMode', value)}
                />
              </FormGroup>
              <FormGroup>
                <Label>Units system</Label>
                <Field
                  as={Select}
                  value={values.unitSystem}
                  options={unitSystemOptions}
                  onChange={({ value }) => setFieldValue('unitsSystem', value)}
                />
              </FormGroup>
            </FormBody>
            <Footer>
              <Button type="submit">{I18n.t('general.save')}</Button>
              <Button type="button" onClick={handleHide}>
                {I18n.t('general.cancel')}
              </Button>
            </Footer>
          </form>
        )}
      />
    </Modal>
  )
}

export default SettingsModal
