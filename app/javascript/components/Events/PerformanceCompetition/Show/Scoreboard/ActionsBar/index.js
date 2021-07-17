import React, { useState } from 'react'

import { useNewCategoryMutation } from 'api/hooks/performanceCompetitions'
import PlusIcon from 'icons/plus.svg'
import CategoryForm from 'components/CategoryForm'
import styles from './styles.module.scss'

const ActionsBar = ({ eventId }) => {
  const [categoryFormShown, setCategoryFormShown] = useState(false)
  const [competitorFormShown, setCompetitorFormShown] = useState(false)

  const newCategoryMutation = useNewCategoryMutation(eventId, {
    onSuccess: () => setCategoryFormShown(false)
  })

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={() => setCategoryFormShown(true)}>
        <PlusIcon /> &nbsp; Category
      </button>
      <button className={styles.button} onClick={() => setCompetitorFormShown(true)}>
        <PlusIcon /> &nbsp; Competitor
      </button>
      <button className={styles.button}>
        <PlusIcon /> &nbsp; Round
      </button>

      {categoryFormShown && (
        <CategoryForm
          mutation={newCategoryMutation}
          onHide={() => setCategoryFormShown(false)}
        />
      )}
    </div>
  )
}

ActionsBar.propTypes
export default ActionsBar
