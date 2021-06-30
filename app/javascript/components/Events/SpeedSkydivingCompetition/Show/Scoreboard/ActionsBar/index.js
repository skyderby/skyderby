import React, { useState } from 'react'
import PropTypes from 'prop-types'

import {
  useNewCategoryMutation,
  useNewRoundMutation
} from 'api/hooks/speedSkydivingCompetitions'
import PlusIcon from 'icons/plus.svg'
import CategoryForm from '../CategoryForm'
import styles from './styles.module.scss'

const ActionsBar = ({ eventId }) => {
  const newRoundMutation = useNewRoundMutation()
  const newCategoryMutation = useNewCategoryMutation()
  const [categoryFormShown, setCategoryFormShown] = useState(false)

  const addRound = () => newRoundMutation.mutateAsync(eventId)
  const addCategory = values => newCategoryMutation.mutateAsync({ eventId, ...values })

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={() => setCategoryFormShown(true)}>
        <PlusIcon /> &nbsp; Category
      </button>
      <button className={styles.button}>
        <PlusIcon /> &nbsp; Competitor
      </button>
      <button className={styles.button} onClick={addRound}>
        <PlusIcon /> &nbsp; Round
      </button>

      {categoryFormShown && (
        <CategoryForm
          initialValues={{ name: '' }}
          onSubmit={addCategory}
          onHide={() => setCategoryFormShown(false)}
        />
      )}
    </div>
  )
}

ActionsBar.propTypes = {
  eventId: PropTypes.number.isRequired
}

export default ActionsBar
