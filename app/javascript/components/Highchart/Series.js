import { useLayoutEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const Series = ({ chart, data, ...props }) => {
  const series = useRef()

  useLayoutEffect(() => {
    if (!chart) return

    if (series.current) {
      series.current.update({ data, ...props })
    } else {
      series.current = chart.addSeries({ data, ...props })
    }
  }, [chart, data, props])

  useLayoutEffect(() => {
    return () => series.current?.chart && series.current?.destroy()
  }, [])

  return null
}

Series.propTypes = {
  chart: PropTypes.object,
  data: PropTypes.array
}

export default Series
