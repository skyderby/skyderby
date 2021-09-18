import { useLayoutEffect, memo } from 'react'
import { AxisPlotBandsOptions, Chart } from 'highcharts'

type PlotbandProps = AxisPlotBandsOptions & {
  chart: Chart
}

const Plotband = ({ chart, id, from, to, ...props }: PlotbandProps): null => {
  useLayoutEffect(() => {
    if (!chart) return

    chart.xAxis[0]?.addPlotBand({ id, from, to, ...props })

    return () => {
      if (id) chart.xAxis[0]?.removePlotBand(id)
    }
  }, [chart, id, from, to, props])

  return null
}

export default memo(Plotband)
