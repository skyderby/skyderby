import React, { useEffect, useState, memo } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import RangeSlider from 'components/RangeSlider'

import AltitudeChart from 'components/AltitudeChart'

export const useTrackPoints = (trackId, options = {}) => {
  const [points, setPoints] = useState([])

  useEffect(() => {
    let isCancelled = false
    const dataUrl = `/api/v1/tracks/${trackId}/points?trimmed=${options.trimmed}`
    axios.get(dataUrl).then(({ data }) => {
      if (isCancelled) return
      setPoints(data)
    })
    return () => (isCancelled = true)
  }, [trackId, options.trimmed])

  return points
}

const AltitudeRangeSelect = ({ trackId, value, onChange }) => {
  const points = useTrackPoints(trackId, { trimmed: false })
  const jumpDuration = points.length > 0 ? points[points.length - 1].flTime : 1

  const handleUpdate = values => {
    if (onChange instanceof Function) onChange({ from: values[0], to: values[1] })
  }

  return (
    <>
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
      />
    </>
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
