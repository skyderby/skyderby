import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useCompetitorQuery, useRoundQuery } from 'api/speedSkydivingCompetitions'
import { useProfileQuery } from 'api/profiles'
import Modal from 'components/ui/Modal'
import Charts from './Charts'
import JumpRange from './JumpRange'
import TabBar from './TabBar'

const ResultModal = ({ event, result, onHide: hide, deleteResult }) => {
  const [currentTab, setCurrentTab] = useState('charts')
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
      {currentTab === 'charts' && <Charts {...tabProps} />}
      {currentTab === 'jumpRange' && <JumpRange {...tabProps} />}
    </Modal>
  )
}

ResultModal.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  result: PropTypes.shape({
    id: PropTypes.number.isRequired,
    competitorId: PropTypes.number.isRequired,
    roundId: PropTypes.number.isRequired,
    trackId: PropTypes.number.isRequired,
    result: PropTypes.number
  }).isRequired,
  onHide: PropTypes.func.isRequired,
  deleteResult: PropTypes.func.isRequired
}

export default ResultModal
