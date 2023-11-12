import { QueryFunction, useQuery, UseQueryOptions } from '@tanstack/react-query'
import client from 'api/client'
import { AxiosError, AxiosResponse } from 'axios'

import {
  assignmentsEndpoint,
  ReferencePointAssignment,
  AssignmentsQueryKey,
  assignmentsQueryKey
} from './common'

const getReferencePointAssignments = (eventId: number) =>
  client
    .get<never, AxiosResponse<ReferencePointAssignment[]>>(assignmentsEndpoint(eventId))
    .then(response => response.data)

const queryFn: QueryFunction<
  ReferencePointAssignment[],
  AssignmentsQueryKey
> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const data = await getReferencePointAssignments(eventId)

  return data
}

const useReferencePointAssignmentsQuery = <T = ReferencePointAssignment[]>(
  eventId: number,
  options: Omit<
    UseQueryOptions<ReferencePointAssignment[], AxiosError, T, AssignmentsQueryKey>,
    'queryKey' | 'queryFn'
  > = {}
) =>
  useQuery({
    queryKey: assignmentsQueryKey(eventId),
    queryFn,
    ...options
  })

export default useReferencePointAssignmentsQuery
