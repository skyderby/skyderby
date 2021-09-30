import React from 'react'
import PropTypes from 'prop-types'

import { useManufacturersQuery } from 'api/hooks/manufacturer'
import Highchart from 'components/Highchart'
import IndexLayout from 'components/Suits/IndexLayout'
import useChartOptions from './useChartOptions'
import styles from './styles.module.scss'
import { useSuitPopularityQuery } from 'api/hooks/suitsPopularity'
import { useAllSuitsQuery } from 'api/hooks/suits'

const SuitsOverview = (): JSX.Element => {
  const { data: suits } = useAllSuitsQuery()
  const { data: popularity } = useSuitPopularityQuery()
  const { data: allManufacturers } = useManufacturersQuery({ enabled: false })

  const options = useChartOptions(suits, popularity, allManufacturers)

  return (
    <IndexLayout>
      <div className={styles.chartContainer}>
        <Highchart autoResize options={options} />
      </div>
    </IndexLayout>
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
