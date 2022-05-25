import { useLayoutEffect, useRef } from 'react'
import type { Chart, Series as SeriesType, SeriesOptionsType } from 'highcharts'

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

export default Series
