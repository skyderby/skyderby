import React, { useState } from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import UploadIcon from 'icons/upload'
import NewResultForm from '../NewResultForm'
import ResultModal from '../ResultModal'
import styles from './styles.module.scss'
import { useDeleteResultMutation } from 'api/hooks/speedSkydivingCompetitions'

const ResultCell = ({ className, event, roundId, competitorId, result }) => {
  const [showNewResultModal, setShowNewResultModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const deleteMutation = useDeleteResultMutation()

  const hideResultModal = () => setShowResultModal(false)

  const deleteResult = async () => {
    if (!confirm('Are you sure you want delete this result?')) return

    try {
      await deleteMutation.mutateAsync({ eventId: event.id, id: result.id })
      hideResultModal()
    } catch (err) {
      console.warn(err)
    }
  }

  return (
    <td className={cx(className, styles.resultCell)}>
      {result ? (
        <>
          <button className={styles.showResult} onClick={() => setShowResultModal(true)}>
            {result.result.toFixed(2)}
          </button>

          {showResultModal && (
            <ResultModal
              event={event}
              result={result}
              deleteResult={deleteResult}
              onHide={hideResultModal}
            />
          )}
        </>
      ) : (
        <>
          {event.permissions.canEdit && (
            <button
              className={styles.newResult}
              onClick={() => setShowNewResultModal(true)}
              title="Upload new result"
            >
              <UploadIcon />
            </button>
          )}

          {!result && showNewResultModal && (
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
  className: PropTypes.string,
  roundId: PropTypes.number.isRequired,
  competitorId: PropTypes.number.isRequired,
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  result: PropTypes.shape({
    id: PropTypes.number.isRequired,
    result: PropTypes.number
  })
}

export default ResultCell
