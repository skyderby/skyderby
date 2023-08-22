import React, { useState } from 'react'

import {
  useCompetitorQuery,
  useRoundQuery,
  PerformanceCompetition,
  Result
} from 'api/performanceCompetitions'
import { useProfileQuery } from 'api/profiles'
import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import TabBar, { Tab } from './TabBar'

type ResultModalProps = {
  event: PerformanceCompetition
  result: Result
  onHide: () => void
  deleteResult: () => unknown
}

const ResultModal = ({ event, result, onHide: hide, deleteResult }: ResultModalProps) => {
  const { t } = useI18n()
  const [currentTab, setCurrentTab] = useState<Tab>('charts')
  const { data: competitor } = useCompetitorQuery(event.id, result.competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: round } = useRoundQuery(event.id, result.roundId)

  const _tabProps = {
    event: event,
    result: result,
    deleteResult: deleteResult,
    hide: hide,
    tabBar: event.permissions.canEdit ? (
      <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
    ) : null
  }

  if (!round) return null

  return (
    <Modal
      isShown={true}
      onHide={hide}
      title={`Result: ${profile?.name} - Round ${t(`disciplines.${round.task}`)} - ${
        round.number
      }`}
      size="lg"
    >
      {currentTab === 'charts' && (
        <>
          <div>Charts</div>
        </>
      )}
    </Modal>
  )
}

export default ResultModal
