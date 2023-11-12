import { QueryFunction, useQuery } from '@tanstack/react-query'
import client from 'api/client'
import { AxiosResponse } from 'axios'

export interface ReferencePoint {
  id: number
  name: string
  latitude: number
  longitude: number
}

type QueryKey = ['performanceCompetition', number, 'referencePoints']
const endpoint = (eventId: number) =>
  `/api/v1/performance_competitions/${eventId}/reference_points`

const getReferencePoints = (eventId: number) =>
  client
    .get<never, AxiosResponse<ReferencePoint[]>>(endpoint(eventId))
    .then(response => response.data)

const queryKey = (eventId: number): QueryKey => [
  'performanceCompetition',
  eventId,
  'referencePoints'
]

const queryFn: QueryFunction<ReferencePoint[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const data = await getReferencePoints(eventId)

  return data
}

const useReferencePointsQuery = (eventId: number) =>
  useQuery({
    queryKey: queryKey(eventId),
    queryFn
  })

export default useReferencePointsQuery
