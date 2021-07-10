import React, { useState } from 'react'
import PropTypes from 'prop-types'

import {
  useCompetitorsQuery,
  useDeleteTeamMutation,
  useEditTeamMutation,
  useTeamQuery
} from 'api/hooks/speedSkydivingCompetitions'
import PencilIcon from 'icons/pencil'
import TimesIcon from 'icons/times'
import TeamForm from './TeamForm'
import styles from './styles.module.scss'
import { useProfileQueries } from 'api/hooks/profiles/profile'

const teamCompetitorNames = (competitors, profileQueries) =>
  competitors
    .map(
      competitor =>
        profileQueries.find(
          query => !query.isLoading && query.data.id === competitor.profileId
        )?.data?.name
    )
    .join(', ')

const StandingRow = ({ event, teamId, rank, total }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const { data: team } = useTeamQuery(event.id, teamId)
  const { data: competitors } = useCompetitorsQuery(event.id, {
    select: data => data.filter(competitor => competitor.teamId === teamId)
  })
  const profileQueries = useProfileQueries(
    competitors.map(competitor => competitor.profileId)
  )
  const editMutation = useEditTeamMutation()
  const deleteMutation = useDeleteTeamMutation()
  const deleteTeam = () => {
    if (confirm('Are you sure you want delete this team?')) {
      deleteMutation.mutate({ eventId: event.id, id: teamId })
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
                initialValues={team}
              />
            )}
          </div>
        )}
      </td>
      <td>{total}</td>
    </tr>
  )
}

StandingRow.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  teamId: PropTypes.number.isRequired,
  rank: PropTypes.number.isRequired,
  total: PropTypes.number
}

export default StandingRow
