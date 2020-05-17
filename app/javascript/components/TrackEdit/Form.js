import React from 'react'
import { useDispatch } from 'react-redux'
import { Formik } from 'formik'
import PropTypes from 'prop-types'
import I18n from 'i18n-js'

import AltitudeRangeSelect from 'components/AltitudeRangeSelect'
import DefaultButton from 'components/ui/buttons/Default'
import RedButton from 'components/ui/buttons/Red'
import PrimaryButton from 'components/ui/buttons/Primary'
import { deleteTrack } from 'redux/tracks'

import { FormGroup, Footer } from './elements'

const Form = ({ track }) => {
  const dispatch = useDispatch()

  const formValues = {
    jumpRange: track.jumpRange
  }

  const handleSubmit = console.log

  const handleDelete = async () => {
    const confirmed = confirm(I18n.t('tracks.show.delete_confirmation'))

    if (!confirmed) return

    await dispatch(deleteTrack(track.id))
  }

  const handleCancel = () => console.log('cancel')

  return (
    <Formik initialValues={formValues} onSubmit={handleSubmit}>
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
            <RedButton type="button" outlined onClick={handleDelete}>
              {I18n.t('general.delete')}
            </RedButton>

            <div>
              <PrimaryButton type="submit">{I18n.t('general.save')}</PrimaryButton>
              <DefaultButton type="button" onClick={handleCancel}>
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
  }).isRequired
}

export default Form
