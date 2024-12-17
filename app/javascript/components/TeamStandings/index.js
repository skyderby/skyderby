import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { selectAllTeams } from 'redux/events/teams/selectors'
import { usePageContext } from 'components/PageContext'

import Scoreboard from './Scoreboard'
import NewTeamModal from './NewTeamModal'

const rankTeams = (teams, competitors) =>
  teams
    .map(team => {
      const teamCompetitors = team.competitorIds
        .map(id => competitors.find(competitor => competitor.id === id))
        .filter(el => el)

      const points = teamCompetitors.reduce(
        (acc, competitor) => acc + competitor.total_points,
        0
      )

      return {
        ...team,
        points,
        competitors: teamCompetitors
      }
    })
    .sort((a, b) => {
      if (a.points > b.points) return -1
      if (a.points < b.points) return 1

      return 0
    })

const TeamsCompetition = ({ competitors }) => {
  const { editable } = usePageContext()
  const teams = useSelector(selectAllTeams)
  const [showNewForm, setShowNewForm] = useState(false)

  const rankedTeams = rankTeams(teams, competitors)

  const handleAddClick = () => setShowNewForm(true)

  return (
    <>
      {editable && (
        <div className="card actions-bar">
          <button className="actions-bar-button" onClick={handleAddClick}>
            <i className="fa fa-plus" />
            &nbsp; Team
          </button>

          <NewTeamModal isShown={showNewForm} onHide={() => setShowNewForm(false)} />
        </div>
      )}

      <Scoreboard rankedTeams={rankedTeams} />
    </>
  )
}

TeamsCompetition.propTypes = {
  competitors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      total_points: PropTypes.number.isRequired
    })
  )
}

TeamsCompetition.defaultProps = {
  competitors: []
}

export default TeamsCompetition
