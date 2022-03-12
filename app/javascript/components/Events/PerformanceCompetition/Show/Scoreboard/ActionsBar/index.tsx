import React, { useRef, useState } from 'react'

import {
  useCreateCategoryMutation,
  useCreateCompetitorMutation,
  useCreateRoundMutation,
  Round
} from 'api/performanceCompetitions'
import useClickOutside from 'hooks/useClickOutside'
import Dropdown from 'components/Dropdown'
import { useI18n } from 'components/TranslationsProvider'
import CategoryForm from 'components/CategoryForm'
import PlusIcon from 'icons/plus.svg'
import CompetitorForm from '../CompetitorForm'
import styles from './styles.module.scss'

type ActionsBarProps = {
  eventId: number
}

const ActionsBar = ({ eventId }: ActionsBarProps) => {
  const { t } = useI18n()
  const [categoryFormShown, setCategoryFormShown] = useState(false)
  const [competitorFormShown, setCompetitorFormShown] = useState(false)
  const [showRoundActions, setShowRoundActions] = useState(false)

  const newRoundButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useClickOutside([menuRef, newRoundButtonRef], () => setShowRoundActions(false))

  const createCategoryMutation = useCreateCategoryMutation(eventId)
  const createCompetitorMutation = useCreateCompetitorMutation(eventId)
  const createRoundMutation = useCreateRoundMutation(eventId)

  const createRound = (task: Round['task']) =>
    createRoundMutation.mutate(task, {
      onSuccess: () => setShowRoundActions(false)
    })

  const toggleRoundsDropdown = () => setShowRoundActions(prev => !prev)

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={() => setCategoryFormShown(true)}>
        <PlusIcon /> &nbsp; Category
      </button>
      <button className={styles.button} onClick={() => setCompetitorFormShown(true)}>
        <PlusIcon /> &nbsp; Competitor
      </button>
      <button
        className={styles.button}
        onClick={toggleRoundsDropdown}
        ref={newRoundButtonRef}
      >
        <PlusIcon /> &nbsp; Round
      </button>

      {categoryFormShown && (
        <CategoryForm
          mutation={createCategoryMutation}
          onHide={() => setCategoryFormShown(false)}
        />
      )}

      {competitorFormShown && (
        <CompetitorForm
          eventId={eventId}
          mutation={createCompetitorMutation}
          onHide={() => setCompetitorFormShown(false)}
        />
      )}

      {showRoundActions && (
        <Dropdown
          ref={menuRef}
          referenceElement={newRoundButtonRef.current}
          options={{ placement: 'bottom-end' }}
        >
          <button
            className={styles.actionButton}
            onClick={() => createRoundMutation.mutate('speed')}
          >
            {t('disciplines.speed')}
          </button>
          <button
            className={styles.actionButton}
            onClick={() => createRoundMutation.mutate('distance')}
          >
            {t('disciplines.distance')}
          </button>
          <button
            className={styles.actionButton}
            onClick={() => createRoundMutation.mutate('time')}
          >
            {t('disciplines.time')}
          </button>
        </Dropdown>
      )}
    </div>
  )
}

export default ActionsBar
