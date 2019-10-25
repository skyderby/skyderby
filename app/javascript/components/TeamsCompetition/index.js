import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import PropTypes from 'prop-types'

import Team from './Team'

const rankTeams = (teams, competitors) =>
  teams
    .map(team => {
      const teamCompetitors = competitors.filter(
        competitor => competitor.team_id === team.id
      )

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

const TeamsCompetition = ({ eventId }) => {
  const [teams, setTeams] = useState([])
  const [competitors, setCompetitors] = useState([])

  const loadData = async eventId => {
    const url = `/api/v1/events/${eventId}/scoreboard.json`
    const {
      data: { teams, competitors }
    } = await axios.get(url)

    setTeams(teams)
    setCompetitors(competitors)
  }

  useEffect(() => {
    loadData(eventId)
  }, [eventId])

  const rankedTeams = rankTeams(teams, competitors)

  return (
    <Container>
      {rankedTeams.map((team, idx) => (
        <Team key={team.id} rank={idx + 1} {...team} />
      ))}
    </Container>
  )
}

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: 30px 0;
`

TeamsCompetition.propTypes = {
  eventId: PropTypes.string.isRequired
}

export default TeamsCompetition
