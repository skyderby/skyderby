import { useMutation, useQueryClient } from 'react-query'
import client from 'api/client'

import {
  collectionEndpoint,
  queryKey,
  PerformanceCompetitionVariables,
  SerializedPerformanceCompetition,
  deserialize
} from './common'
import { AxiosResponse } from 'axios'

const createEvent = (performanceCompetition: PerformanceCompetitionVariables) =>
  client.post<
    { performanceCompetition: PerformanceCompetitionVariables },
    AxiosResponse<SerializedPerformanceCompetition>
  >(collectionEndpoint, { performanceCompetition })

const useCreatePerformanceEventMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createEvent, {
    onSuccess(response) {
      queryClient.setQueryData(queryKey(response.data.id), deserialize(response.data))
    }
  })
}

export default useCreatePerformanceEventMutation
