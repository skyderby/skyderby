import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'

import useChartOptions from './useChartOptions'

const CombinedChart = ({ points, zeroWindPoints }) => {
  const { unitSystem } = useSelector(state => state.userPreferences)
  const options = useChartOptions(points, zeroWindPoints, unitSystem)

  return <Highchart options={options} />
}

export default CombinedChart
