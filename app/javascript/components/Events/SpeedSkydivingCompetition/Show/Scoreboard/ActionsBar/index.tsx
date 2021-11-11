import React, { useState } from 'react'

import {
  useNewCategoryMutation,
  useNewRoundMutation,
  useNewCompetitorMutation
} from 'api/speedSkydivingCompetitions'
import { SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions/types'
import PlusIcon from 'icons/plus.svg'
import CategoryForm from 'components/CategoryForm'
import CompetitorForm from '../CompetitorForm'
import StatusMenu from './StatusMenu'
import styles from './styles.module.scss'

type ActionsBarProps = {
  event: SpeedSkydivingCompetition
}

const ActionsBar = ({ event }: ActionsBarProps): JSX.Element => {
  const [categoryFormShown, setCategoryFormShown] = useState(false)
  const [competitorFormShown, setCompetitorFormShown] = useState(false)

  const newRoundMutation = useNewRoundMutation()
  const newCategoryMutation = useNewCategoryMutation(event.id, {
    onSuccess: () => setCategoryFormShown(false)
  })
  const newCompetitorMutation = useNewCompetitorMutation(event.id)

  const addRound = () => newRoundMutation.mutateAsync(event.id)

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

      <div className={styles.spacer} />

      <StatusMenu event={event} />

      {categoryFormShown && (
        <CategoryForm
          mutation={newCategoryMutation}
          onHide={() => setCategoryFormShown(false)}
        />
      )}

      {competitorFormShown && (
        <CompetitorForm
          eventId={event.id}
          mutation={newCompetitorMutation}
          onHide={() => setCompetitorFormShown(false)}
        />
      )}
    </div>
  )
}

export default ActionsBar
