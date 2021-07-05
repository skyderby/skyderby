import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { selectUserPreferences, SINGLE_CHART } from 'redux/userPreferences'

import SplittedCharts from './SplittedCharts'
import CombinedChart from './CombinedChart'

const Charts = ({ points, zeroWindPoints, children }) => {
  const { chartMode } = useSelector(selectUserPreferences)

  const ChartComponent = chartMode === SINGLE_CHART ? CombinedChart : SplittedCharts

  return (
    <ChartComponent points={points} zeroWindPoints={zeroWindPoints}>
      {children}
    </ChartComponent>
  )
}

Charts.propTypes = {
  points: PropTypes.array.isRequired,
  zeroWindPoints: PropTypes.array,
  children: PropTypes.func
}

export default Charts
