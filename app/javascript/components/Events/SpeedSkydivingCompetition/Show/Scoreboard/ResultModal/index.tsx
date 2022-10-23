import React, { useState } from 'react'

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

type ResultModalProps = {
  event: SpeedSkydivingCompetition
  result: Result
  onHide: () => unknown
  deleteResult: () => unknown
}

const ResultModal = ({
  event,
  result,
  onHide: hide,
  deleteResult
}: ResultModalProps): JSX.Element => {
  const { t } = useI18n()
  const [currentTab, setCurrentTab] = useState<Tab>('charts')
  const { data: competitor } = useCompetitorQuery(event.id, result.competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: round } = useRoundQuery(event.id, result.roundId)

  const tabProps = {
    event: event,
    result: result,
    deleteResult: deleteResult,
    hide: hide,
    tabBar: event.permissions.canEdit ? (
      <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
    ) : null
  }

  return (
    <Modal
      isShown={true}
      onHide={hide}
      title={`Result: ${profile?.name} - Round ${round?.number}`}
      size="lg"
    >
      {currentTab === 'charts' && (
        <>
          <Charts {...tabProps} />
          <Modal.Footer spaceBetween={event.permissions.canEdit}>
            {event.permissions.canEdit && (
              <button className={styles.deleteButton} onClick={deleteResult}>
                {t('general.delete')}
              </button>
            )}
            <button className={styles.defaultButton} onClick={hide}>
              {t('general.back')}
            </button>
          </Modal.Footer>
        </>
      )}

      {currentTab === 'jumpRange' && <JumpRange {...tabProps} />}
      {currentTab === 'penalties' && <Penalties {...tabProps} />}
    </Modal>
  )
}

export default ResultModal
