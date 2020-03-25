import React from 'react'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'
import useChartOptions from './useChartOptions'

const PlaceholderChart = ({ text }) => {
  const options = useChartOptions()

  return (
    <Highchart autoResize options={options} loading={text}>
      {chart => <Highchart.Series chart={chart} data={[]} />}
    </Highchart>
  )
}

PlaceholderChart.propTypes = {
  text: PropTypes.string.isRequired
}

export default PlaceholderChart
