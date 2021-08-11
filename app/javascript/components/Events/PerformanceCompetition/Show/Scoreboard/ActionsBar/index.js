import React, { useRef, useState } from 'react'

import {
  useNewCategoryMutation,
  useNewCompetitorMutation,
  useNewRoundMutation
} from 'api/hooks/performanceCompetitions'
import useClickOutside from 'hooks/useClickOutside'
import Dropdown from 'components/Dropdown'
import { useI18n } from 'components/TranslationsProvider'
import CategoryForm from 'components/CategoryForm'
import PlusIcon from 'icons/plus.svg'
import CompetitorForm from '../CompetitorForm'
import styles from './styles.module.scss'

const ActionsBar = ({ eventId }) => {
  const { t } = useI18n()
  const [categoryFormShown, setCategoryFormShown] = useState(false)
  const [competitorFormShown, setCompetitorFormShown] = useState(false)
  const [showRoundActions, setShowRoundActions] = useState(false)

  const newRoundButtonRef = useRef()
  const menuRef = useRef()

  useClickOutside([menuRef, newRoundButtonRef], () => setShowRoundActions(false))

  const newCategoryMutation = useNewCategoryMutation(eventId, {
    onSuccess: () => setCategoryFormShown(false)
  })
  const newCompetitorMutation = useNewCompetitorMutation(eventId, {
    onSuccess: () => setCompetitorFormShown(false)
  })
  const newRoundMutation = useNewRoundMutation(eventId, {
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
          mutation={newCategoryMutation}
          onHide={() => setCategoryFormShown(false)}
        />
      )}

      {competitorFormShown && (
        <CompetitorForm
          eventId={eventId}
          mutation={newCompetitorMutation}
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
            onClick={() => newRoundMutation.mutate('speed')}
          >
            {t('disciplines.speed')}
          </button>
          <button
            className={styles.actionButton}
            onClick={() => newRoundMutation.mutate('distance')}
          >
            {t('disciplines.distance')}
          </button>
          <button
            className={styles.actionButton}
            onClick={() => newRoundMutation.mutate('time')}
          >
            {t('disciplines.time')}
          </button>
        </Dropdown>
      )}
    </div>
  )
}

ActionsBar.propTypes
export default ActionsBar
