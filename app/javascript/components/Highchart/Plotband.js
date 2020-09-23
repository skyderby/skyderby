import { useLayoutEffect, memo } from 'react'
import PropTypes from 'prop-types'

const Plotband = ({ chart, id, from, to, ...props }) => {
  useLayoutEffect(() => {
    if (!chart) return

    chart.xAxis[0].addPlotBand({ id, from, to, ...props })

    return () => chart.xAxis?.[0].removePlotBand(id)
  }, [chart, id, from, to, props])

  return null
}

Plotband.propTypes = {
  chart: PropTypes.object,
  id: PropTypes.string.isRequired,
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired
}

export default memo(Plotband)
