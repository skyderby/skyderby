import React from 'react'
import { Formik } from 'formik'
import PropTypes from 'prop-types'
import I18n from 'i18n-js'

import AltitudeRangeSelect from 'components/AltitudeRangeSelect'
import DefaultButton from 'components/ui/buttons/Default'
import RedButton from 'components/ui/buttons/Red'
import PrimaryButton from 'components/ui/buttons/Primary'

import { FormGroup, Footer } from './elements'

const Form = ({ track, onSubmit, onDelete, onCancel }) => {
  const formValues = {
    jumpRange: track.jumpRange
  }

  return (
    <Formik initialValues={formValues} onSubmit={onSubmit}>
      {({ values, setFieldValue, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <AltitudeRangeSelect
              trackId={track.id}
              jumpRange={values.jumpRange}
              onChange={val => setFieldValue('jumpRange', val)}
            />
          </FormGroup>

          <hr />

          <FormGroup>
            <label>Suit</label>
            <input />
          </FormGroup>

          <FormGroup>
            <label>Place</label>
            <input />
          </FormGroup>

          <FormGroup>
            <label>Activity</label>
            <input />
          </FormGroup>

          <FormGroup>
            <label>Visibility</label>
            <input />
          </FormGroup>

          <FormGroup>
            <label>Comment</label>
            <textarea />
          </FormGroup>

          <hr />

          <Footer>
            <RedButton type="button" outlined onClick={onDelete}>
              {I18n.t('general.delete')}
            </RedButton>

            <div>
              <PrimaryButton type="submit">{I18n.t('general.save')}</PrimaryButton>
              <DefaultButton type="button" onClick={onCancel}>
                {I18n.t('general.cancel')}
              </DefaultButton>
            </div>
          </Footer>
        </form>
      )}
    </Formik>
  )
}

Form.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    jumpRange: PropTypes.shape({
      from: PropTypes.number.isRequired,
      to: PropTypes.number.isRequired
    }).isRequired
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}

export default Form
