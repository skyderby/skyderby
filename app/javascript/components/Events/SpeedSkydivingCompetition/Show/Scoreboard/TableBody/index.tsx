import React from 'react'

import Category from './Category'
import StandingRow from './StandingRow'
import styles from './styles.module.scss'
import type {
  SpeedSkydivingCompetition,
  Round,
  Category as CategoryRecord,
  CategoryStandings
} from 'api/speedSkydivingCompetitions'

type TableBodyProps = {
  event: SpeedSkydivingCompetition
  rounds: Round[]
  categories: CategoryRecord[]
  standings: CategoryStandings[]
}

const TableBody = ({
  event,
  rounds,
  categories,
  standings
}: TableBodyProps): JSX.Element => {
  return (
    <>
      {categories.map(category => (
        <tbody key={category.id} className={styles.categoryStandings}>
          <Category event={event} category={category} colSpan={rounds.length + 5} />

          {standings
            .find(({ categoryId }) => category.id === categoryId)
            ?.rows?.map(row => (
              <StandingRow
                key={row.competitorId}
                event={event}
                rounds={rounds}
                row={row}
              />
            ))}
        </tbody>
      ))}
    </>
  )
}

export default TableBody
