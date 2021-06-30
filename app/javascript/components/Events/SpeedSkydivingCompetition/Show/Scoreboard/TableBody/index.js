import React from 'react'
import PropTypes from 'prop-types'

import Category from './Category'
import styles from './styles.module.scss'

const Index = ({ event, rounds, competitors, categories, standings }) => {
  return (
    <>
      {categories.map(category => (
        <tbody key={category.id} className={styles.categoryStandings}>
          <tr>
            <Category event={event} category={category} colSpan={rounds.length + 5} />
          </tr>
        </tbody>
      ))}
    </>
  )
}

Index.propTypes = {
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
  }).isRequired
}

export default Index
