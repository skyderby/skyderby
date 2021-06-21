import React from 'react'
import PropTypes from 'prop-types'

import Category from './Category'

const TableBody = ({ roundsByTask, competitors, categories, standings }) => {
  return (
    <>
      {categories.map(category => (
        <Category
          key={category.id}
          category={category}
          competitors={competitors}
          roundsByTask={roundsByTask}
          standings={standings.find(el => el.categoryId == category.id).rows}
        />
      ))}
    </>
  )
}

TableBody.propTypes = {
  roundsByTask: PropTypes.arrayOf(PropTypes.array).isRequired,
  competitors: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  standings: PropTypes.arrayOf(
    PropTypes.shape({
      categoryId: PropTypes.number.isRequired,
      rows: PropTypes.array.isRequired
    })
  ).isRequired
}
export default TableBody
