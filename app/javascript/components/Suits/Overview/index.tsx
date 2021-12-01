import React from 'react'

import { useManufacturersQuery } from 'api/manufacturer'
import Highchart from 'components/Highchart'
import IndexLayout from 'components/Suits/IndexLayout'
import useChartOptions from './useChartOptions'
import styles from './styles.module.scss'
import { useSuitPopularityQuery } from 'api/suitsPopularity'
import { useAllSuitsQuery } from 'api/suits'

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

export default SuitsOverview
