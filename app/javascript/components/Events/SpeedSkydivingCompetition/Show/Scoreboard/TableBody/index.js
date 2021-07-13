import React from 'react'
import PropTypes from 'prop-types'

import Category from './Category'
import StandingRow from './StandingRow'
import styles from './styles.module.scss'

const TableBody = ({ event, rounds, categories, standings }) => {
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

TableBody.propTypes = {
  rounds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      number: PropTypes.number.isRequired
    })
  ).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      position: PropTypes.number.isRequired
    })
  ).isRequired,
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  standings: PropTypes.arrayOf(
    PropTypes.shape({
      categoryId: PropTypes.number.isRequired,
      rows: PropTypes.arrayOf(
        PropTypes.shape({
          rank: PropTypes.number.isRequired,
          competitorId: PropTypes.number.isRequired
        })
      ).isRequired
    })
  ).isRequired
}

export default TableBody
