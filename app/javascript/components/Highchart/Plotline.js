import { useEffect } from 'react'
import PropTypes from 'prop-types'

const Plotline = ({ chart, id, value, ...props }) => {
  useEffect(() => {
    if (!chart) return

    chart.xAxis[0].addPlotLine({ id, value, ...props })

    return () => chart.xAxis?.[0].removePlotLine(id)
  }, [chart, id, value, props])

  return null
}

Plotline.propTypes = {
  chart: PropTypes.object,
  id: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired
}

export default Plotline
