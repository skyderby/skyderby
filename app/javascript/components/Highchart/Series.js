import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const Series = ({ chart, data, ...props }) => {
  const series = useRef()

  useEffect(() => {
    if (!chart) return

    if (series.current) {
      series.current.update({ data, ...props })
    } else {
      series.current = chart.addSeries({ data, ...props })
    }
  }, [chart, data, props])

  useEffect(() => {
    return () => series.current?.destroy()
  }, [])

  return null
}

Series.propTypes = {
  chart: PropTypes.object,
  data: PropTypes.array
}

export default Series
