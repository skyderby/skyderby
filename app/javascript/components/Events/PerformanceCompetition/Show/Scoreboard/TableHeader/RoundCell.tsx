import React, { useMemo, useRef, useState } from 'react'
import cx from 'clsx'
import { AxiosError } from 'axios'
import Tippy from '@tippyjs/react'
import toast from 'react-hot-toast'

import {
  PerformanceCompetition,
  Round,
  useDeleteRoundMutation,
  useUpdateRoundMutation
} from 'api/performanceCompetitions'
import useClickOutside from 'hooks/useClickOutside'
import { useI18n } from 'components/TranslationsProvider'
import Dropdown from 'components/Dropdown'
import EllipsisIcon from 'icons/ellipsis-v'
import CircleIcon from 'icons/circle'
import CheckCircleIcon from 'icons/check-circle'
import RequestErrorToast from 'components/RequestErrorToast'
import styles from './styles.module.scss'

type RoundProps = {
  event: PerformanceCompetition
  round: Round
}

const RoundCell = ({ event, round }: RoundProps) => {
  const { t } = useI18n()
  const [showRoundActions, setShowRoundActions] = useState(false)
  const actionsButtonRef = useRef<HTMLTableCellElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const deleteMutation = useDeleteRoundMutation(event.id, round.id)
  const updateMutation = useUpdateRoundMutation(event.id, round.id)

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

  const deleteRound = () => deleteMutation.mutate(undefined, mutationOptions)
  const toggleCompleted = () =>
    updateMutation.mutate(
      {
        completed: !round.completed
      },
      mutationOptions
    )

  return (
    <th className={styles.round} ref={actionsButtonRef} colSpan={2}>
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
              options={{
                placement: 'bottom-end',
                modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
              }}
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
