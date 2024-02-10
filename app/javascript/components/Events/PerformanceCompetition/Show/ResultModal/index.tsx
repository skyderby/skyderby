import React, { useState, startTransition } from 'react'
import toast from 'react-hot-toast'
import RequestErrorToast from 'components/RequestErrorToast'
import {
  useCompetitorQuery,
  useDeleteResultMutation,
  PerformanceCompetition,
  Result,
  Round
} from 'api/performanceCompetitions'
import { useProfileQuery } from 'api/profiles'
import { useI18n } from 'components/TranslationsProvider'
import Modal from 'components/ui/Modal'
import Charts from './Charts'
import JumpRange from './JumpRange'

type Props = {
  event: PerformanceCompetition
  round: Round
  result: Result
  onHide: () => void
}

const tabs = ['charts', 'jump_range'] as const
const tabsRequireEditPermission = {
  charts: false,
  jump_range: true
} as const

type Tab = typeof tabs[number]

const ResultModal = ({ event, result, round, onHide: hide }: Props) => {
  const { t } = useI18n()
  const [currentTab, setCurrentTab] = useState<Tab>('charts')
  const { data: competitor } = useCompetitorQuery(event.id, result.competitorId)
  const { data: profile } = useProfileQuery(competitor?.profileId)
  const deleteMutation = useDeleteResultMutation(event.id, result.id)
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
    tabBar: (
      <Modal.TabBar>
        {tabs
          .filter(tab => !tabsRequireEditPermission[tab] || event.permissions.canEdit)
          .map(tab => (
            <Modal.TabBar.Tab
              key={tab}
              active={currentTab === tab}
              onClick={() => startTransition(() => setCurrentTab(tab))}
            >
              {t(`performance_competitions.result_modal.tabs.${tab}`)}
            </Modal.TabBar.Tab>
          ))}
      </Modal.TabBar>
    )
  }

  return (
    <Modal
      isShown={true}
      onHide={hide}
      title={`Result: ${profile?.name} | ${t(`disciplines.${round.task}`)} - ${
        round.number
      }`}
      size="lg"
    >
      {currentTab === 'charts' && <Charts {...tabProps} />}
      {currentTab === 'jump_range' && <JumpRange {...tabProps} />}
    </Modal>
  )
}

export default ResultModal
