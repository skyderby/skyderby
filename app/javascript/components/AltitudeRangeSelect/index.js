import React, { useState, memo } from 'react'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import RangeSlider from 'components/RangeSlider'
import AltitudeChart from 'components/AltitudeChart'
import useTrackPoints from 'hooks/useTrackPoints'

import { Container } from './elements'

const AltitudeRangeSelect = ({
  trackId,
  value: initialValue,
  onChange: onChangeCallback
}) => {
  const [value, setValue] = useState(initialValue)

  const points = useTrackPoints(trackId, { trimmed: false })
  const jumpDuration = points.length > 0 ? points[points.length - 1].flTime : 1

  const handleUpdate = values => {
    const newValue = { from: values[0], to: values[1] }

    if (value.from === newValue.from && value.to === newValue.to) return

    setValue(newValue)
  }

  const handleChange = values => {
    if (onChangeCallback instanceof Function)
      onChangeCallback({ from: values[0], to: values[1] })
  }

  return (
    <Container>
      <AltitudeChart points={points}>
        {chart => (
          <>
            <Highchart.Plotband
              id="from"
              chart={chart}
              from={0}
              to={value.from}
              color="rgba(0, 0, 0, 0.25)"
              zIndex={8}
            />
            <Highchart.Plotband
              id="to"
              chart={chart}
              from={value.to}
              to={jumpDuration}
              color="rgba(0, 0, 0, 0.25)"
              zIndex={8}
            />
          </>
        )}
      </AltitudeChart>

      <RangeSlider
        domain={[0, jumpDuration]}
        values={[value.from, value.to]}
        step={1}
        onUpdate={handleUpdate}
        onChange={handleChange}
      />
    </Container>
  )
}

AltitudeRangeSelect.propTypes = {
  trackId: PropTypes.number.isRequired,
  value: PropTypes.shape({
    from: PropTypes.number.isRequired,
    to: PropTypes.number.isRequired
  }),
  onChange: PropTypes.func.isRequired
}

export default memo(AltitudeRangeSelect)
