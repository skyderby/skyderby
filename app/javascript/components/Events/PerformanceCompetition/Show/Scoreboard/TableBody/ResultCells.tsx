import React, { useState } from 'react'

import { useProfileQuery } from 'api/profiles'
import {
  useCompetitorQuery,
  useRoundQuery,
  useDeleteResultMutation,
  Result,
  Round,
  PerformanceCompetition
} from 'api/performanceCompetitions'
import { useI18n } from 'components/TranslationsProvider'
import ResultModal from 'components/Events/PerformanceCompetition/Show/ResultModal'
import styles from './styles.module.scss'
import toast from 'react-hot-toast'
import RequestErrorToast from 'components/RequestErrorToast'

type ResultCellsProps = {
  event: PerformanceCompetition
  result: Result | undefined
  points: number | undefined
}

const formattedResult = (record: Result, task: Round['task']) => {
  if (!record) return

  const result = Number(record.result)
  return result.toFixed(task === 'distance' ? 0 : 1)
}

const formattedPoints = (points: number | undefined) => {
  if (!points) return

  const score = Number(points)
  return score.toFixed(1)
}

const ResultCells = ({ event, result, points }: ResultCellsProps) => {
  const { t } = useI18n()
  const [showResultModal, setShowResultModal] = useState(false)
  const hideResultModal = () => setShowResultModal(false)
  const { data: competitor } = useCompetitorQuery(event.id, result?.competitorId)
  const { data: round } = useRoundQuery(event.id, result?.roundId)
  const { data: profile } = useProfileQuery(competitor?.profileId, { enabled: false })
  const deleteMutation = useDeleteResultMutation(event.id, result?.id)

  const deleteResult = () => {
    if (!result) return
    if (!confirm('Are you sure you want delete this result?')) return

    deleteMutation.mutate(undefined, {
      onSuccess: () => hideResultModal(),
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })
  }

  return (
    <React.Fragment>
      <td className={styles.resultCell}>
        {result && round ? (
          <React.Fragment>
            <button
              className={styles.showResult}
              onClick={() => setShowResultModal(true)}
              title={`Show result for ${profile?.name} in ${t(
                `disciplines.${round.task}`
              )} - ${round.number}`}
            >
              {formattedResult(result, round.task)}
            </button>

            {showResultModal && (
              <ResultModal
                event={event}
                result={result}
                deleteResult={deleteResult}
                onHide={hideResultModal}
              />
            )}
          </React.Fragment>
        ) : (
          <button className={styles.newResult}></button>
        )}
      </td>
      <td className={styles.roundScore}>{formattedPoints(points)}</td>
    </React.Fragment>
  )
}

export default ResultCells
