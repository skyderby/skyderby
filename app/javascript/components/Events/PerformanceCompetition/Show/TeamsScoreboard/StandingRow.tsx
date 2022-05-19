import React, { useState } from 'react'

import {
  PerformanceCompetition,
  Competitor,
  useCompetitorsQuery,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useTeamQuery
} from 'api/performanceCompetitions'
import { useProfileQueries } from 'api/profiles'
import PencilIcon from 'icons/pencil'
import TimesIcon from 'icons/times'
import TeamForm from 'components/TeamForm'
import styles from './styles.module.scss'

type StandingRowProps = {
  event: PerformanceCompetition
  teamId: number
  rank: number
  total: number
}

const teamCompetitorNames = (
  competitors: Competitor[],
  profileQueries: ReturnType<typeof useProfileQueries>
): string =>
  competitors
    .map(
      competitor =>
        profileQueries.find(
          query => !query.isLoading && query.data?.id === competitor.profileId
        )?.data?.name
    )
    .join(', ')

const StandingRow = ({ event, teamId, rank, total }: StandingRowProps): JSX.Element => {
  const [showEditModal, setShowEditModal] = useState(false)
  const { data: team } = useTeamQuery(event.id, teamId)
  const { data: competitors = [] } = useCompetitorsQuery(event.id, {
    select: data => data.filter(competitor => competitor.teamId === teamId)
  })
  const profileQueries = useProfileQueries(
    competitors.map(competitor => competitor.profileId)
  )
  const editMutation = useUpdateTeamMutation(event.id, teamId)
  const deleteMutation = useDeleteTeamMutation(event.id, teamId)
  const deleteTeam = () => {
    if (confirm('Are you sure you want delete this team?')) {
      deleteMutation.mutate(undefined)
    }
  }

  const showModal = () => setShowEditModal(true)
  const hideModal = () => setShowEditModal(false)

  const names = teamCompetitorNames(competitors, profileQueries)

  return (
    <tr>
      <td>{rank}</td>
      <td className={styles.teamCell}>
        <span>
          {team?.name}
          {names && (
            <span className={styles.competitorNames}>
              &nbsp; &mdash; &nbsp;
              {names}
            </span>
          )}
        </span>
        {event.permissions.canEdit && (
          <div className={styles.actions}>
            <button className={styles.actionButton} onClick={showModal}>
              <PencilIcon />
            </button>
            <button className={styles.actionButton} onClick={deleteTeam}>
              <TimesIcon />
            </button>

            {showEditModal && (
              <TeamForm
                title="Edit team"
                eventId={event.id}
                onHide={hideModal}
                mutation={editMutation}
                competitorsQuery={useCompetitorsQuery}
                initialValues={team}
              />
            )}
          </div>
        )}
      </td>
      <td>{total && total.toFixed(2)}</td>
    </tr>
  )
}

export default StandingRow
