import React from 'react'
import { useParams } from 'react-router-dom'
import { useResultQuery } from 'api/speedSkydivingCompetitions'
import Charts from 'components/Events/SpeedSkydivingCompetition/Show/Scoreboard/ResultModal/Charts'

const ResultIframe = () => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const resultId = Number(params.resultId)
  const { data: result } = useResultQuery(eventId, resultId)

  if (!result) return null

  return <Charts result={result} />
}

export default ResultIframe
