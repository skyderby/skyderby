import React from 'react'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'

import useChartOptions from './useChartOptions'
import styles from './styles.module.scss'

const SuitsOverview = ({ popularity, allManufacturers }) => {
  const options = useChartOptions(popularity, allManufacturers)

  return (
    <div className={styles.chartContainer}>
      <Highchart autoResize options={options} />
    </div>
  )
}

SuitsOverview.propTypes = {
  popularity: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      makeId: PropTypes.number.isRequired,
      popularity: PropTypes.number.isRequired
    })
  ),
  allManufacturers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  )
}

export default SuitsOverview
