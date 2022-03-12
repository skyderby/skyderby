import React from 'react'

import { PerformanceCompetition, Round, Category as CategoryRecord, CategoryStandings } from 'api/performanceCompetitions'
import Category from './Category'
import StandingRow from './StandingRow'

type RoundsByTask = [Round['task'], Round[]][]

type TableBodyProps = {
  event: PerformanceCompetition
  roundsByTask: RoundsByTask
  categories: CategoryRecord[]
  standings: CategoryStandings[]
}

const categoryColSpan = (roundsByTask: RoundsByTask): number =>
  roundsByTask.length +
  roundsByTask.map(([_task, rounds]) => rounds).flat().length * 2 +
  4

const TableBody = ({ event, roundsByTask, categories, standings }: TableBodyProps) => {
  return (
    <>
      {categories.map(category => (
        <tbody key={category.id}>
          <Category
            event={event}
            category={category}
            colSpan={categoryColSpan(roundsByTask)}
          />

          {standings
            .find(categoryStandings => categoryStandings.categoryId === category.id)
            ?.rows?.map(row => (
              <StandingRow
                key={row.competitorId}
                event={event}
                row={row}
                roundsByTask={roundsByTask}
              />
            ))}
        </tbody>
      ))}
    </>
  )
}

export default TableBody
