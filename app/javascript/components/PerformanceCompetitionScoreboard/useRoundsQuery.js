import { useQuery } from 'react-query'

import Api from 'api'

const useRoundsQuery = eventId => {
  const {
    data: rounds = [],
    isLoading
  } = useQuery(`performanceCompetitions/${eventId}/rounds`, () =>
    Api.PerformanceCompetitions.Rounds.findAll(eventId)
  )

  return { rounds, isLoading }
}

export default useRoundsQuery
