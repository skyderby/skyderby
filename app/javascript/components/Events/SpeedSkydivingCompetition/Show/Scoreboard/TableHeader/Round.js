import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'

import { useDeleteRoundMutation } from 'api/speedSkydivingCompetitions'
import useClickOutside from 'hooks/useClickOutside'
import { useI18n } from 'components/TranslationsProvider'
import EllipsisIcon from 'icons/ellipsis-v'
import Dropdown from 'components/Dropdown'
import styles from './styles.module.scss'

const Round = ({ event, round }) => {
  const { t } = useI18n()
  const [showRoundActions, setShowRoundActions] = useState(false)
  const actionsButtonRef = useRef()
  const menuRef = useRef()
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

Round.propTypes = {
  round: PropTypes.shape({
    id: PropTypes.number.isRequired,
    number: PropTypes.number.isRequired
  }).isRequired,
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired
}

export default Round
