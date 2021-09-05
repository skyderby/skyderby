import React, { useCallback } from 'react'

import AltitudeRangeSelect from 'components/AltitudeRangeSelect'
import { FieldInputProps, FormikProps } from 'formik'
import { TrackJumpRange } from 'api/hooks/tracks'
import { FormData } from './types'

type AltitudeRangeFieldProps = {
  trackId: number
  field: FieldInputProps<TrackJumpRange>
  form: FormikProps<FormData>
}
const AltitudeRangeField = ({
  trackId,
  field: { name, value },
  form: { setFieldValue }
}: AltitudeRangeFieldProps): JSX.Element => {
  const handleChange = useCallback(newValue => setFieldValue(name, newValue), [
    name,
    setFieldValue
  ])

  return <AltitudeRangeSelect value={value} onChange={handleChange} trackId={trackId} />
}

export default AltitudeRangeField
