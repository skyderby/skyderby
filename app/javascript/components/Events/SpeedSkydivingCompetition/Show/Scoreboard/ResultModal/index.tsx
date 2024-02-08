import React, { useState, startTransition } from 'react'
import toast from 'react-hot-toast'
import RequestErrorToast from 'components/RequestErrorToast'
import {
  Result,
  SpeedSkydivingCompetition,
  useCompetitorQuery,
  useDeleteResultMutation,
  useRoundQuery
} from 'api/speedSkydivingCompetitions'
import { useProfileQuery } from 'api/profiles'
import Modal from 'components/ui/Modal'
import Charts from './Charts'
import JumpRange from './JumpRange'
import Penalties from './Penalties'

type ResultModalProps = {
  event: SpeedSkydivingCompetition
  result: Result
  onHide: () => unknown
}

const tabs = ['charts', 'jumpRange', 'penalties'] as const
export type Tab = typeof tabs[number]

const tabTitles = {
  charts: 'Charts',
  jumpRange: 'Jump Range',
  penalties: 'Penalties'
}

const ResultModal = ({ event, result, onHide: hide }: ResultModalProps): JSX.Element => {
  const [currentTab, setCurrentTab] = useState<Tab>('charts')
  const { data: competitor } = useCompetitorQuery(event.id, result.competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const { data: round } = useRoundQuery(event.id, result.roundId)
  const deleteMutation = useDeleteResultMutation(event.id, result?.id)
  const deleteResult = () => {
    if (!result) return
    if (!confirm('Are you sure you want delete this result?')) return

    deleteMutation.mutate(undefined, {
      onSuccess: () => hide(),
      onError: error => {
        toast.error(<RequestErrorToast response={error.response} />)
      }
    })
  }

  const tabProps = {
    event: event,
    result: result,
    deleteResult: deleteResult,
    hide: hide,
    tabBar: event.permissions.canEdit ? (
      <Modal.TabBar>
        {tabs.map(tab => (
          <Modal.TabBar.Tab
            key={tab}
            active={tab === currentTab}
            onClick={() => startTransition(() => setCurrentTab(tab))}
          >
            {tabTitles[tab]}
          </Modal.TabBar.Tab>
        ))}
      </Modal.TabBar>
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
