import { Round, useRoundsQuery } from 'api/speedSkydivingCompetitions'

const useRoundQuery = (eventId: number, id: number) =>
  useRoundsQuery<Round | undefined>(eventId, {
    select: data => data.find(round => round.id === id)
  })

export default useRoundQuery
