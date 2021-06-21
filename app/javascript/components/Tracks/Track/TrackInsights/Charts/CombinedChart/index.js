import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import { selectUserPreferences } from 'redux/userPreferences'

import useChartOptions from './useChartOptions'

const CombinedChart = ({ points, zeroWindPoints }) => {
  const { unitSystem } = useSelector(selectUserPreferences)
  const options = useChartOptions(points, zeroWindPoints, unitSystem)

  return <Highchart autoResize options={options} />
}

CombinedChart.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      flTime: PropTypes.number.isRequired,
      glideRatio: PropTypes.number.isRequired,
      vSpeed: PropTypes.number.isRequired,
      hSpeed: PropTypes.number.isRequired,
      altitude: PropTypes.number.isRequired
    })
  ).isRequired,
  zeroWindPoints: PropTypes.arrayOf(
    PropTypes.shape({
      flTime: PropTypes.number.isRequired,
      hSpeed: PropTypes.number.isRequired,
      glideRatio: PropTypes.number.isRequired
    })
  )
}

export default CombinedChart
