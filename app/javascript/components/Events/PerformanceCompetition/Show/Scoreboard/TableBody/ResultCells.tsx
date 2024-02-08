import React, { useState } from 'react'

import { useProfileQuery } from 'api/profiles'
import {
  useCompetitorQuery,
  Result,
  Round,
  PerformanceCompetition
} from 'api/performanceCompetitions'
import { useI18n } from 'components/TranslationsProvider'
import ResultModal from 'components/Events/PerformanceCompetition/Show/ResultModal'
import UploadIcon from 'icons/upload.svg'
import styles from './styles.module.scss'

type Props = {
  event: PerformanceCompetition
  round: Round
  result: Result | undefined
  points: number | undefined
}

const formattedResult = (result: number, task: Round['task']) =>
  result.toFixed(task === 'distance' ? 0 : 1)

const formattedPoints = (points: number | undefined) => {
  if (points === undefined) return

  const score = Number(points)
  return score.toFixed(1)
}

const ResultCells = ({ event, round, result, points }: Props) => {
  const { t } = useI18n()
  const [showResultModal, setShowResultModal] = useState(false)
  const hideResultModal = () => setShowResultModal(false)
  const { data: competitor } = useCompetitorQuery(event.id, result?.competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId, { enabled: false })

  return (
    <React.Fragment>
      <td className={styles.resultCell}>
        {result ? (
          <React.Fragment>
            <button
              className={styles.showResult}
              onClick={() => setShowResultModal(true)}
              title={`Show result for ${profile?.name} in ${t(
                `disciplines.${round.task}`
              )} - ${round.number}`}
            >
              {formattedResult(result.result, round.task)}
            </button>

            {showResultModal && (
              <React.Suspense fallback={null}>
                <ResultModal event={event} result={result} onHide={hideResultModal} />
              </React.Suspense>
            )}
          </React.Fragment>
        ) : (
          <>
            {event.permissions.canEdit && !round.completed && (
              <button
                className={styles.newResult}
                title={`Submit result for ${profile?.name} in round ${round.task}-${round.number}`}
              >
                <UploadIcon />
              </button>
            )}
            {round.completed && (
              <span className={styles.emptyResult}>{formattedResult(0, round.task)}</span>
            )}
          </>
        )}
      </td>
      <td className={styles.roundScore}>{formattedPoints(points)}</td>
    </React.Fragment>
  )
}

export default ResultCells
