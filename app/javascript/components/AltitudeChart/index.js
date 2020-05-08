import React from 'react'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import useChartOptions from './useChartOptions'

const AltitudeChart = ({ points, children, options: additionalOptions = {} }) => {
  const options = useChartOptions(points, additionalOptions)

  return <Highchart options={options}>{children}</Highchart>
}

AltitudeChart.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      flTime: PropTypes.number,
      altitude: PropTypes.number,
      hSpeed: PropTypes.number,
      vSpeed: PropTypes.number
    })
  ).isRequired,
  children: PropTypes.func,
  options: PropTypes.object
}

export default AltitudeChart
