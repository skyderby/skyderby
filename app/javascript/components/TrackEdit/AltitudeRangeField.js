import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

import AltitudeRangeSelect from 'components/AltitudeRangeSelect'

const AltitudeRangeField = ({
  trackId,
  field: { name, value },
  form: { setFieldValue }
}) => {
  const handleChange = useCallback(newValue => setFieldValue(name, newValue), [
    name,
    setFieldValue
  ])

  return <AltitudeRangeSelect value={value} onChange={handleChange} trackId={trackId} />
}

AltitudeRangeField.propTypes = {
  trackId: PropTypes.number.isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.shape({
      from: PropTypes.number.isRequired,
      to: PropTypes.number.isRequired
    }).isRequired
  }).isRequired,
  form: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired
  }).isRequired
}

export default AltitudeRangeField
