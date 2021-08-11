import React from 'react'
import PropTypes from 'prop-types'

import Category from './Category'
import StandingRow from './StandingRow'

const categoryColSpan = roundsByTask =>
  roundsByTask.length +
  roundsByTask.map(([_task, rounds]) => rounds).flat().length * 2 +
  4

const TableBody = ({ event, roundsByTask, categories, standings }) => {
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

TableBody.propTypes = {
  event: PropTypes.object.isRequired,
  roundsByTask: PropTypes.arrayOf(PropTypes.array).isRequired,
  categories: PropTypes.array.isRequired,
  standings: PropTypes.arrayOf(
    PropTypes.shape({
      categoryId: PropTypes.number.isRequired,
      rows: PropTypes.array.isRequired
    })
  ).isRequired
}
export default TableBody
