import { useEffect } from 'react'
import PropTypes from 'prop-types'

const Plotband = ({ chart, from, to, ...props }) => {
  useEffect(() => {
    if (!chart) return

    const plotBand = chart.xAxis[0].addPlotBand({ from, to, ...props })

    return () => plotBand.destroy()
  }, [chart, from, to, props])

  return null
}

Plotband.propTypes = {
  chart: PropTypes.object,
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired
}

export default Plotband
