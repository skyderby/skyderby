import React, { useState } from 'react'
import cx from 'clsx'

import {
  Result,
  SpeedSkydivingCompetition,
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

const isCalculated = (result: Result) => Number.isFinite(result.result)

const resultPresentation = (result: Result, editable: boolean) => {
  if (isCalculated(result)) return result.result.toFixed(2)
  if (editable) {
    return (
      <span title="Calculation error">
        <TriangleExclamationIcon className={styles.warningIcon} />
      </span>
    )
  }
}

type ResultCellProps = {
  className?: string
  event: SpeedSkydivingCompetition
  roundId: number
  competitorId: number
  result: Result | undefined
}

const ResultCell = ({
  className,
  event,
  roundId,
  competitorId,
  result
}: ResultCellProps): JSX.Element => {
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
    if (!result) return
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
            className={cx(styles.showResult, !isCalculated(result) && styles.withWarning)}
            onClick={() => setShowResultModal(true)}
            title={`Show result for ${profile?.name} in round ${round?.number}`}
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
          {event.permissions.canEdit && !round?.completed && (
            <button
              className={styles.newResult}
              onClick={() => setShowNewResultModal(true)}
              title={`Submit result for ${profile?.name} in round ${round?.number}`}
            >
              <UploadIcon />
            </button>
          )}

          {round?.completed && <span className={styles.emptyResult}>0.00</span>}

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

export default ResultCell