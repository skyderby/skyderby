import React, { useState } from 'react'
import toast from 'react-hot-toast'
import cx from 'clsx'

import {
  useNewCategoryMutation,
  useNewRoundMutation,
  useNewCompetitorMutation,
  useEditSpeedSkydivingCompetitionMutation
} from 'api/speedSkydivingCompetitions'
import { SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions/types'
import PlusIcon from 'icons/plus.svg'
import CategoryForm from 'components/CategoryForm'
import RequestErrorToast from 'components/RequestErrorToast'
import CompetitorForm from '../CompetitorForm'
import StatusMenu from 'components/Events/StatusMenu'
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
  const editEventMutation = useEditSpeedSkydivingCompetitionMutation(event.id)

  const addRound = () =>
    newRoundMutation.mutate(event.id, {
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })

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

      <StatusMenu
        currentStatus={event.status}
        className={cx(styles.button, styles.buttonRight)}
        mutation={editEventMutation}
      />

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
