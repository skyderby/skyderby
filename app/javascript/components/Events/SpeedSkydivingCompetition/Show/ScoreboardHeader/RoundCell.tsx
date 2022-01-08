import React, { useRef, useState, useMemo } from 'react'
import { AxiosError } from 'axios'
import toast from 'react-hot-toast'
import Tippy from '@tippyjs/react'
import cx from 'clsx'

import { Round, SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions/types'
import {
  useDeleteRoundMutation,
  useEditRoundMutation
} from 'api/speedSkydivingCompetitions'
import useClickOutside from 'hooks/useClickOutside'
import { useI18n } from 'components/TranslationsProvider'
import EllipsisIcon from 'icons/ellipsis-v'
import CircleIcon from 'icons/circle'
import CheckCircleIcon from 'icons/check-circle'
import Dropdown from 'components/Dropdown'
import RequestErrorToast from 'components/RequestErrorToast'
import styles from './styles.module.scss'

type RoundProps = {
  event: SpeedSkydivingCompetition
  round: Round
}

const RoundCell = ({ event, round }: RoundProps): JSX.Element => {
  const { t } = useI18n()
  const [showRoundActions, setShowRoundActions] = useState(false)
  const actionsButtonRef = useRef<HTMLTableCellElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const deleteMutation = useDeleteRoundMutation()
  const editMutation = useEditRoundMutation()

  useClickOutside([menuRef, actionsButtonRef], () => setShowRoundActions(false))

  const mutationOptions = useMemo(
    () => ({
      onSettled: () => setShowRoundActions(false),
      onError: (error: AxiosError<Record<string, string[]>>) => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    }),
    []
  )

  const deleteRound = () =>
    deleteMutation.mutate({ eventId: event.id, roundId: round.id }, mutationOptions)

  const toggleCompleted = () => {
    editMutation.mutate(
      {
        eventId: event.id,
        roundId: round.id,
        completed: !round.completed
      },
      mutationOptions
    )
  }

  return (
    <th className={styles.round} ref={actionsButtonRef}>
      {(round.completed || event.permissions.canEdit) && (
        <Tippy
          content={
            round.completed
              ? 'Round results are final'
              : 'Mark round as completed when results are final'
          }
        >
          <div className={cx(styles.roundStatus, round.completed && styles.completed)}>
            {round.completed ? <CheckCircleIcon /> : <CircleIcon />}
          </div>
        </Tippy>
      )}
      {round.number}
      {event.permissions.canEdit && (
        <>
          <button
            className={styles.showActionsButton}
            onClick={() => setShowRoundActions(state => !state)}
          >
            <EllipsisIcon />
          </button>
          {showRoundActions && (
            <Dropdown
              ref={menuRef}
              referenceElement={actionsButtonRef.current}
              options={{ placement: 'bottom-end' }}
            >
              <Dropdown.Button onClick={toggleCompleted}>
                {round.completed ? 'Mark uncompleted' : 'Mark complete'}
              </Dropdown.Button>
              <Dropdown.Button onClick={deleteRound}>
                {t('general.delete')}
              </Dropdown.Button>
            </Dropdown>
          )}
        </>
      )}
    </th>
  )
}

export default RoundCell
