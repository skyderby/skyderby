import React, { useRef, useState } from 'react'
import cx from 'clsx'

import {
  useCreateCategoryMutation,
  useCreateCompetitorMutation,
  useCreateRoundMutation,
  useCopyCompetitorsMutation,
  useUpdatePerformanceCompetitionMutation,
  Round,
  PerformanceCompetition
} from 'api/performanceCompetitions'
import useClickOutside from 'hooks/useClickOutside'
import Dropdown from 'components/Dropdown'
import { useI18n } from 'components/TranslationsProvider'
import CategoryForm from 'components/CategoryForm'
import StatusMenu from 'components/Events/StatusMenu'
import PlusIcon from 'icons/plus.svg'
import ChevronDownIcon from 'icons/chevron-down.svg'
import CompetitorForm from '../CompetitorForm'
import CopyFromOtherEventForm from '../CopyFromOtherEventForm'
import styles from './styles.module.scss'

type ActionsBarProps = {
  event: PerformanceCompetition
}

const ActionsBar = ({ event }: ActionsBarProps) => {
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

  const createCategoryMutation = useCreateCategoryMutation(event.id)
  const createCompetitorMutation = useCreateCompetitorMutation(event.id)
  const createRoundMutation = useCreateRoundMutation(event.id)
  const copyCompetitorsMutation = useCopyCompetitorsMutation(event.id)
  const editEventMutation = useUpdatePerformanceCompetitionMutation(event.id)

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

      <StatusMenu
        currentStatus={event.status}
        className={cx(styles.button, styles.pullRight, styles.right)}
        mutation={editEventMutation}
      />
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
          eventId={event.id}
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
          options={{
            placement: 'bottom-end',
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
          }}
        >
          <Dropdown.Button onClick={() => createRound('speed')}>
            {t('disciplines.speed')}
          </Dropdown.Button>
          <Dropdown.Button onClick={() => createRound('distance')}>
            {t('disciplines.distance')}
          </Dropdown.Button>
          <Dropdown.Button onClick={() => createRound('time')}>
            {t('disciplines.time')}
          </Dropdown.Button>
        </Dropdown>
      )}

      {showMoreActions && (
        <Dropdown
          ref={moreActionsMenuRef}
          referenceElement={moreActionsButtonRef.current}
          options={{
            placement: 'bottom-end',
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
          }}
        >
          <Dropdown.Button
            onClick={() => {
              setShowMoreActions(false)
              setCopyCompetitorsFormShown(true)
            }}
          >
            Copy competitors
          </Dropdown.Button>
        </Dropdown>
      )}
    </div>
  )
}

export default ActionsBar
