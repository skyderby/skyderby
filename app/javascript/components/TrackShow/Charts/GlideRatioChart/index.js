import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'

import useChartOptions from './useChartOptions'

const GlideRatioChart = forwardRef(({ points = [], zeroWindPoints = [] }, ref) => {
  const options = useChartOptions(points, zeroWindPoints)

  return <Highchart ref={ref} options={options} />
})

GlideRatioChart.displayName = 'GlideRatioChart'

GlideRatioChart.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      flTime: PropTypes.number.isRequired,
      glideRatio: PropTypes.number.isRequired,
      altitude: PropTypes.number.isRequired
    })
  ).isRequired,
  zeroWindPoints: PropTypes.arrayOf(
    PropTypes.shape({
      flTime: PropTypes.number.isRequired,
      glideRatio: PropTypes.number.isRequired
    })
  )
}

export default GlideRatioChart
