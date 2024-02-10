import React, { useState } from 'react'

import {
  SpeedSkydivingCompetition,
  Competitor,
  useCompetitorsQuery,
  useDeleteTeamMutation,
  useEditTeamMutation,
  useTeamQuery
} from 'api/speedSkydivingCompetitions'
import PencilIcon from 'icons/pencil'
import TimesIcon from 'icons/times'
import TeamForm from 'components/TeamForm'
import styles from './styles.module.scss'
import { useProfileQueries } from 'api/profiles'

type StandingRowProps = {
  event: SpeedSkydivingCompetition
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
  const { data: competitors } = useCompetitorsQuery(event.id)
  const teamCompetitors = competitors.filter(competitor => competitor.teamId === teamId)
  const profileQueries = useProfileQueries(
    teamCompetitors.map(competitor => competitor.profileId)
  )
  const editMutation = useEditTeamMutation(event.id, teamId)
  const deleteMutation = useDeleteTeamMutation()
  const deleteTeam = () => {
    if (confirm('Are you sure you want delete this team?')) {
      deleteMutation.mutate({ eventId: event.id, id: teamId })
    }
  }

  const showModal = () => setShowEditModal(true)
  const hideModal = () => setShowEditModal(false)

  const names = teamCompetitorNames(teamCompetitors, profileQueries)

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
                competitors={competitors}
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
