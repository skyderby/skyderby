import React, { useRef, useState } from 'react'

import { Round, SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions/types'
import { useDeleteRoundMutation } from 'api/speedSkydivingCompetitions'
import useClickOutside from 'hooks/useClickOutside'
import { useI18n } from 'components/TranslationsProvider'
import EllipsisIcon from 'icons/ellipsis-v'
import Dropdown from 'components/Dropdown'
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

  useClickOutside([menuRef, actionsButtonRef], () => setShowRoundActions(false))

  const deleteRound = () =>
    deleteMutation.mutate({ eventId: event.id, roundId: round.id })

  return (
    <th className={styles.round} ref={actionsButtonRef}>
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
              <button className={styles.actionButton} onClick={deleteRound}>
                {t('general.delete')}
              </button>
            </Dropdown>
          )}
        </>
      )}
    </th>
  )
}

export default RoundCell
