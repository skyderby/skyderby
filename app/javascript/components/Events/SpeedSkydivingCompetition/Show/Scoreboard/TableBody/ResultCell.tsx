import React, { useState } from 'react'
import cx from 'clsx'
import toast from 'react-hot-toast'
import Tippy from '@tippyjs/react'

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
import RequestErrorToast from 'components/RequestErrorToast'
import NewResultForm from '../NewResultForm'
import ResultModal from '../ResultModal'
import styles from './styles.module.scss'

const isCalculated = (result: Result) => Number.isFinite(result.result)
const hasPenalty = (result: Result) => result.penalties.length > 0
const penaltyDescription = (result: Result) => {
  if (!hasPenalty(result)) return ''
  const rawResult = result.result.toFixed(2)
  const finalResult = result.finalResult.toFixed(2)
  const penalty = result.penaltySize.toFixed()
  return (
    <>
      <span>
        {rawResult} - {penalty}% = {finalResult}
      </span>
      <br />
      Reason:
      <ul>
        {result.penalties.map((penalty, idx) => (
          <li key={idx}>- {penalty.reason}</li>
        ))}
      </ul>
    </>
  )
}

const resultPresentation = (result: Result, editable: boolean) => {
  if (isCalculated(result)) {
    return (
      <Tippy content={penaltyDescription(result)} disabled={!hasPenalty(result)}>
        <span>
          {result.finalResult.toFixed(2)}
          {hasPenalty(result) && (
            <sup className={styles.penalty}>
              &nbsp;
              {`-${result.penaltySize.toFixed()}%`}
            </sup>
          )}
        </span>
      </Tippy>
    )
  }

  if (editable) {
    return (
      <Tippy content="Calculation error">
        <span>
          <TriangleExclamationIcon className={styles.warningIcon} />
        </span>
      </Tippy>
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

    deleteMutation.mutate(
      { eventId: event.id, id: result.id },
      {
        onSuccess: () => hideResultModal(),
        onError: error => {
          toast.error(<RequestErrorToast response={error.response} />)
        }
      }
    )
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
