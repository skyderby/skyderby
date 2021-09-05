import { useLayoutEffect, useRef } from 'react'
import { Chart, Series as SeriesType, SeriesOptionsType } from 'highcharts'
import PropTypes from 'prop-types'

type SeriesProps = SeriesOptionsType & {
  chart: Chart
}

const Series = ({ chart, ...seriesOptions }: SeriesProps): null => {
  const series = useRef<SeriesType>()

  useLayoutEffect(() => {
    if (!chart) return

    if (!series.current) {
      series.current = chart.addSeries(seriesOptions)
    } else {
      series.current.update(seriesOptions)
    }
  }, [chart, seriesOptions])

  useLayoutEffect(() => {
    return () => series.current?.chart && series.current?.remove()
  }, [])

  return null
}

Series.propTypes = {
  chart: PropTypes.object,
  data: PropTypes.array
}

export default Series
