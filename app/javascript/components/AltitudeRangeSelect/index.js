import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import RangeSlider from 'components/RangeSlider'
import useChartOptions from './useChartOptions'

const AltitudeRangeSelect = ({ trackId, jumpRange, onChange }) => {
  const [points, setPoints] = useState([])

  const options = useChartOptions(points)

  const jumpDuration = points.length > 0 ? points[points.length - 1].flTime : 1

  useEffect(() => {
    let isCancelled = false

    const dataUrl = `/api/v1/tracks/${trackId}/points?trimmed=false`

    axios.get(dataUrl).then(({ data }) => {
      if (isCancelled) return

      setPoints(data)
    })

    return () => (isCancelled = true)
  }, [trackId])

  const handleUpdate = values => {
    if (onChange instanceof Function) onChange({ from: values[0], to: values[1] })
  }

  return (
    <>
      <Highchart options={options}>
        {chart => (
          <>
            <Highchart.Plotband
              chart={chart}
              from={0}
              to={jumpRange.from}
              color="rgba(0, 0, 0, 0.3)"
              zIndex={8}
            />
            <Highchart.Plotband
              chart={chart}
              from={jumpRange.to}
              to={jumpDuration}
              color="rgba(0, 0, 0, 0.3)"
              zIndex={8}
            />
          </>
        )}
      </Highchart>

      <RangeSlider
        domain={[0, jumpDuration]}
        values={[jumpRange.from, jumpRange.to]}
        step={1}
        onUpdate={handleUpdate}
      />
    </>
  )
}

AltitudeRangeSelect.propTypes = {
  trackId: PropTypes.number.isRequired,
  jumpRange: PropTypes.shape({
    from: PropTypes.number.isRequired,
    to: PropTypes.number.isRequired
  }),
  onChange: PropTypes.func.isRequired
}

export default AltitudeRangeSelect
