import React, { startTransition, useState } from 'react'

import {
  Result,
  SpeedSkydivingCompetition,
  useCompetitorQuery,
  useRoundQuery
} from 'api/speedSkydivingCompetitions'
import { useProfileQuery } from 'api/profiles'
import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import Charts from './Charts'
import JumpRange from './JumpRange'
import Penalties from './Penalties'
import TabBar, { Tab } from './TabBar'
import styles from 'components/Events/SpeedSkydivingCompetition/Show/Scoreboard/ResultModal/styles.module.scss'

type Props = {
  event: SpeedSkydivingCompetition
  result: Result
  onHide: () => unknown
  deleteResult: () => unknown
}

const ResultModal = ({ event, result, onHide: hide, deleteResult }: Props) => {
  const { t } = useI18n()
  const [currentTab, setCurrentTab] = useState<Tab>('charts')
  const { data: competitor } = useCompetitorQuery(event.id, result.competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: round } = useRoundQuery(event.id, result.roundId)

  const changeTab = (tab: Tab) => startTransition(() => setCurrentTab(tab))

  const tabProps = {
    event: event,
    result: result,
    deleteResult: deleteResult,
    hide: hide,
    tabBar: event.permissions.canEdit ? (
      <TabBar currentTab={currentTab} setCurrentTab={changeTab} />
    ) : null
  }

  return (
    <Modal
      isShown={true}
      onHide={hide}
      title={`Result: ${profile?.name} - Round ${round?.number}`}
      size="lg"
    >
      {currentTab === 'charts' && <Charts {...tabProps} />}
      {currentTab === 'jumpRange' && <JumpRange {...tabProps} />}
      {currentTab === 'penalties' && <Penalties {...tabProps} />}
    </Modal>
  )
}

export default ResultModal
