import React, { useState } from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import {
  useCompetitorQuery,
  useDeleteResultMutation,
  useNewResultMutation,
  useRoundQuery
} from 'api/speedSkydivingCompetitions'
import { useProfileQuery } from 'api/profiles'
import UploadIcon from 'icons/upload.svg'
import TriangleExclamationIcon from 'icons/triangle-exclamation.svg'
import NewResultForm from '../NewResultForm'
import ResultModal from '../ResultModal'
import styles from './styles.module.scss'

const resultPresentation = (result, editable) => {
  if (Number.isFinite(result.result)) return result.result.toFixed(2)
  if (editable) {
    return (
      <TriangleExclamationIcon className={styles.warningIcon} title="Calculation error" />
    )
  }
}

const ResultCell = ({ className, event, roundId, competitorId, result }) => {
  const [showNewResultModal, setShowNewResultModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const deleteMutation = useDeleteResultMutation()
  const { data: competitor } = useCompetitorQuery(event.id, competitorId)
  const { data: round } = useRoundQuery(event.id, roundId)
  const { data: profile } = useProfileQuery(competitor?.profileId, { enabled: false })

  const hideResultModal = () => setShowResultModal(false)
  const hideResultSubmissionModal = () => setShowNewResultModal(false)
  const newResultMutation = useNewResultMutation({
    onSuccess: () => {
      hideResultSubmissionModal()
    }
  })

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
          <button
            className={styles.showResult}
            onClick={() => setShowResultModal(true)}
            title={`Show result for ${profile.name} in round ${round.number}`}
          >
            {resultPresentation(result, event.permissions.canEdit)}
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
              title={`Submit result for ${profile.name} in round ${round.number}`}
            >
              <UploadIcon />
            </button>
          )}

          {!result && showNewResultModal && (
            <NewResultForm
              event={event}
              competitorId={competitorId}
              mutation={newResultMutation}
              roundId={roundId}
              onHide={hideResultSubmissionModal}
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
