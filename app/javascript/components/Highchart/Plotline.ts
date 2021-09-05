import { useLayoutEffect, memo } from 'react'
import { AxisPlotLinesOptions, Chart } from 'highcharts'

type PlotlineProps = AxisPlotLinesOptions & {
  chart: Chart
}

const Plotline = ({ chart, id, value, ...props }: PlotlineProps): null => {
  useLayoutEffect(() => {
    if (!chart) return

    chart.xAxis[0]?.addPlotLine({ id, value, ...props })

    return () => {
      if (id) chart.xAxis[0]?.removePlotLine(id)
    }
  }, [chart, id, value, props])

  return null
}

export default memo(Plotline)
