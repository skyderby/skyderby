import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { SINGLE_CHART } from 'redux/userPreferences/chartMode'

import SplittedCharts from './SplittedCharts'
import CombinedChart from './CombinedChart'

const Charts = ({ points, zeroWindPoints }) => {
  const { chartMode } = useSelector(state => state.userPreferences)

  if (chartMode === SINGLE_CHART) {
    return <CombinedChart points={points} zeroWindPoints={zeroWindPoints} />
  } else {
    return <SplittedCharts points={points} zeroWindPoints={zeroWindPoints} />
  }
}

Charts.propTypes = {
  points: PropTypes.array.isRequired,
  zeroWindPoints: PropTypes.array
}

export default Charts
