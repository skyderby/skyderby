import React, { useState } from 'react'
import PropTypes from 'prop-types'

import UploadIcon from 'icons/upload'
import NewResultForm from '../NewResultForm'
import styles from './styles.module.scss'

const ResultCell = ({ event, roundId, competitorId }) => {
  const [showNewResultModal, setShowNewResultModal] = useState(false)

  return (
    <td className={styles.resultCell}>
      {event.permissions.canEdit && (
        <>
          <button
            className={styles.newResult}
            onClick={() => setShowNewResultModal(true)}
          >
            <UploadIcon />
          </button>

          {showNewResultModal && (
            <NewResultForm
              event={event}
              competitorId={competitorId}
              roundId={roundId}
              onHide={() => setShowNewResultModal(false)}
            />
          )}
        </>
      )}
    </td>
  )
}

ResultCell.propTypes = {
  roundId: PropTypes.number.isRequired,
  competitorId: PropTypes.number.isRequired,
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired
}

export default ResultCell
