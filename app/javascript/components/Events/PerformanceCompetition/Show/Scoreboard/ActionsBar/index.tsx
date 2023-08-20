import React, { useRef, useState } from 'react'
import cx from 'clsx'

import {
  useCreateCategoryMutation,
  useCreateCompetitorMutation,
  useCreateRoundMutation,
  useCopyCompetitorsMutation,
  Round
} from 'api/performanceCompetitions'
import useClickOutside from 'hooks/useClickOutside'
import Dropdown from 'components/Dropdown'
import { useI18n } from 'components/TranslationsProvider'
import CategoryForm from 'components/CategoryForm'
import PlusIcon from 'icons/plus.svg'
import ChevronDownIcon from 'icons/chevron-down.svg'
import CompetitorForm from '../CompetitorForm'
import CopyFromOtherEventForm from '../CopyFromOtherEventForm'
import styles from './styles.module.scss'

type ActionsBarProps = {
  eventId: number
}

const ActionsBar = ({ eventId }: ActionsBarProps) => {
  const { t } = useI18n()
  const [categoryFormShown, setCategoryFormShown] = useState(false)
  const [competitorFormShown, setCompetitorFormShown] = useState(false)
  const [copyCompetitorsFormShow, setCopyCompetitorsFormShown] = useState(false)
  const [showRoundActions, setShowRoundActions] = useState(false)
  const [showMoreActions, setShowMoreActions] = useState(false)

  const newRoundButtonRef = useRef<HTMLButtonElement>(null)
  const newRoundMenuRef = useRef<HTMLDivElement>(null)
  useClickOutside([newRoundMenuRef, newRoundButtonRef], () => setShowRoundActions(false))

  const moreActionsButtonRef = useRef<HTMLButtonElement>(null)
  const moreActionsMenuRef = useRef<HTMLDivElement>(null)
  useClickOutside([moreActionsMenuRef, moreActionsButtonRef], () =>
    setShowMoreActions(false)
  )

  const createCategoryMutation = useCreateCategoryMutation(eventId)
  const createCompetitorMutation = useCreateCompetitorMutation(eventId)
  const createRoundMutation = useCreateRoundMutation(eventId)
  const copyCompetitorsMutation = useCopyCompetitorsMutation(eventId)

  const createRound = (task: Round['task']) =>
    createRoundMutation.mutate(task, {
      onSuccess: () => setShowRoundActions(false)
    })

  const toggleRoundsDropdown = () => setShowRoundActions(prev => !prev)
  const toggleMoreActionsDropdown = () => setShowMoreActions(prev => !prev)

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={() => setCategoryFormShown(true)}>
        <PlusIcon />
        &nbsp;
        <span>Category</span>
      </button>
      <button className={styles.button} onClick={() => setCompetitorFormShown(true)}>
        <PlusIcon />
        &nbsp;
        <span>Competitor</span>
      </button>
      <button
        className={styles.button}
        onClick={toggleRoundsDropdown}
        ref={newRoundButtonRef}
      >
        <PlusIcon />
        &nbsp;
        <span>Round</span>
        &nbsp;
        <ChevronDownIcon />
      </button>
      <button
        className={cx(styles.button, styles.right)}
        onClick={toggleMoreActionsDropdown}
        ref={moreActionsButtonRef}
      >
        More &nbsp;
        <ChevronDownIcon />
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

      {copyCompetitorsFormShow && (
        <CopyFromOtherEventForm
          mutation={copyCompetitorsMutation}
          onHide={() => setCopyCompetitorsFormShown(false)}
        />
      )}

      {showRoundActions && (
        <Dropdown
          ref={newRoundMenuRef}
          referenceElement={newRoundButtonRef.current}
          options={{ placement: 'bottom-end' }}
        >
          <button className={styles.actionButton} onClick={() => createRound('speed')}>
            {t('disciplines.speed')}
          </button>
          <button className={styles.actionButton} onClick={() => createRound('distance')}>
            {t('disciplines.distance')}
          </button>
          <button className={styles.actionButton} onClick={() => createRound('time')}>
            {t('disciplines.time')}
          </button>
        </Dropdown>
      )}

      {showMoreActions && (
        <Dropdown
          ref={moreActionsMenuRef}
          referenceElement={moreActionsButtonRef.current}
          options={{ placement: 'bottom-end' }}
        >
          <button
            className={styles.actionButton}
            onClick={() => {
              setShowMoreActions(false)
              setCopyCompetitorsFormShown(true)
            }}
          >
            Copy competitors
          </button>
        </Dropdown>
      )}
    </div>
  )
}

export default ActionsBar
