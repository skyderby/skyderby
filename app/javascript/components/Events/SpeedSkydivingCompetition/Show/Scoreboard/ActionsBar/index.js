import React, { useState } from 'react'
import PropTypes from 'prop-types'

import {
  useNewCategoryMutation,
  useNewRoundMutation,
  useNewCompetitorMutation
} from 'api/hooks/speedSkydivingCompetitions'
import PlusIcon from 'icons/plus.svg'
import CategoryForm from '../CategoryForm'
import CompetitorForm from '../CompetitorForm'
import styles from './styles.module.scss'

const ActionsBar = ({ eventId }) => {
  const [categoryFormShown, setCategoryFormShown] = useState(false)
  const [competitorFormShown, setCompetitorFormShown] = useState(false)

  const newRoundMutation = useNewRoundMutation()
  const newCategoryMutation = useNewCategoryMutation()
  const newCompetitorMutation = useNewCompetitorMutation()

  const addRound = () => newRoundMutation.mutateAsync(eventId)
  const addCategory = values => newCategoryMutation.mutateAsync({ eventId, ...values })
  const addCompetitor = values =>
    newCompetitorMutation.mutateAsync({ eventId, ...values })

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={() => setCategoryFormShown(true)}>
        <PlusIcon /> &nbsp; Category
      </button>
      <button className={styles.button} onClick={() => setCompetitorFormShown(true)}>
        <PlusIcon /> &nbsp; Competitor
      </button>
      <button className={styles.button} onClick={addRound}>
        <PlusIcon /> &nbsp; Round
      </button>

      {categoryFormShown && (
        <CategoryForm onSubmit={addCategory} onHide={() => setCategoryFormShown(false)} />
      )}

      {competitorFormShown && (
        <CompetitorForm
          eventId={eventId}
          onSubmit={addCompetitor}
          onHide={() => setCompetitorFormShown(false)}
        />
      )}
    </div>
  )
}

ActionsBar.propTypes = {
  eventId: PropTypes.number.isRequired
}

export default ActionsBar
