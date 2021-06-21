import { useQuery } from 'react-query'
import axios from 'axios'

const endpoint = eventId => `/api/v1/performance_competitions/${eventId}/reference_points`

const getReferencePoints = eventId => axios.get(endpoint(eventId))

const queryKey = eventId => ['performanceCompetition', eventId, 'referencePoints']

const queryFn = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getReferencePoints(eventId)

  return data
}

const useReferencePointsQuery = eventId =>
  useQuery({
    queryKey: queryKey(eventId),
    queryFn
  })

export default useReferencePointsQuery
