import React from 'react'
import { Formik } from 'formik'
import PropTypes from 'prop-types'

import AltitudeRangeSelect from 'components/AltitudeRangeSelect'

const Form = ({ track }) => {
  return (
    <Formik initialValues={{ jumpRange: track.jumpRange }}>
      {({ values, setFieldValue }) => (
        <AltitudeRangeSelect
          trackId={track.id}
          jumpRange={values.jumpRange}
          onChange={val => setFieldValue('jumpRange', val)}
        />
      )}
    </Formik>
  )
}

Form.propTypes = {
  track: PropTypes.shape({
    jumpRange: PropTypes.shape({
      from: PropTypes.number.isRequired,
      to: PropTypes.number.isRequired
    }).isRequired
  }).isRequired
}

export default Form
