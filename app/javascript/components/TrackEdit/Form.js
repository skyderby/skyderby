import React from 'react'
import { Formik } from 'formik'
import PropTypes from 'prop-types'

import AltitudeRangeSelect from 'components/AltitudeRangeSelect'
import { FormGroup } from './elements'

const Form = ({ track }) => {
  return (
    <Formik initialValues={{ jumpRange: track.jumpRange }}>
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
