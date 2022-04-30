import { QueryFunction, useQuery, UseQueryOptions } from 'react-query'
import client from 'api/client'
import { AxiosError, AxiosResponse } from 'axios'

import { assignmentsEndpoint, ReferencePointAssignment, AssignmentsQueryKey, assignmentsQueryKey } from './common'

const getReferencePointAssignments = (eventId: number) =>
  client
    .get<never, AxiosResponse<ReferencePointAssignment[]>>(assignmentsEndpoint(eventId))
    .then(response => response.data)

const queryFn: QueryFunction<ReferencePointAssignment[], AssignmentsQueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const data = await getReferencePointAssignments(eventId)

  return data
}

const useReferencePointAssignmentsQuery = <T = ReferencePointAssignment[]>(
  eventId: number,
  options: UseQueryOptions<ReferencePointAssignment[], AxiosError, T, AssignmentsQueryKey> = {}
) =>
  useQuery({
    queryKey: assignmentsQueryKey(eventId),
    queryFn,
    ...options
  })

export default useReferencePointAssignmentsQuery
