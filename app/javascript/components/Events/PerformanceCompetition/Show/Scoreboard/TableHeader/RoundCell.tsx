import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'

import {
  PerformanceCompetition,
  Round,
  useDeleteRoundMutation
} from 'api/performanceCompetitions'
import useClickOutside from 'hooks/useClickOutside'
import { useI18n } from 'components/TranslationsProvider'
import EllipsisIcon from 'icons/ellipsis-v'
import Dropdown from 'components/Dropdown'
import styles from './styles.module.scss'

type RoundProps = {
  event: PerformanceCompetition
  round: Round
}

const RoundCell = ({ event, round }: RoundProps) => {
  const { t } = useI18n()
  const [showRoundActions, setShowRoundActions] = useState(false)
  const actionsButtonRef = useRef<HTMLTableHeaderCellElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const deleteMutation = useDeleteRoundMutation(event.id, round.id)

  useClickOutside([menuRef, actionsButtonRef], () => setShowRoundActions(false))

  const deleteRound = () => deleteMutation.mutate()

  return (
    <th className={styles.round} ref={actionsButtonRef} colSpan={2}>
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
