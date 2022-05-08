import { useMutation, useQueryClient } from 'react-query'

import client, { AxiosResponse } from 'api/client'
import {
  assignmentsEndpoint,
  assignmentsQueryKey,
  ReferencePointAssignment
} from './common'

type AssignmentVariables = {
  competitorId: number
  roundId: number
  referencePointId: number | null
}

const updateAssignment = (
  eventId: number,
  referencePointAssignment: AssignmentVariables
) =>
  client.post<
    { referencePointAssignment: AssignmentVariables },
    AxiosResponse<ReferencePointAssignment>
  >(assignmentsEndpoint(eventId), { referencePointAssignment })

const useUpdateReferencePointAssignmentMutation = (eventId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (variables: AssignmentVariables) =>
    updateAssignment(eventId, variables)

  return useMutation(mutationFn, {
    async onSuccess(response, variables) {
      const isDeletion = variables.referencePointId === null
      const data: ReferencePointAssignment[] =
        queryClient.getQueryData(assignmentsQueryKey(eventId)) ?? []

      const updatedData = data.filter(
        record =>
          record.roundId !== variables.roundId ||
          record.competitorId !== variables.competitorId
      )

      if (!isDeletion) updatedData.push(response.data)

      queryClient.setQueryData(assignmentsQueryKey(eventId), updatedData)
    }
  })
}

export default useUpdateReferencePointAssignmentMutation
