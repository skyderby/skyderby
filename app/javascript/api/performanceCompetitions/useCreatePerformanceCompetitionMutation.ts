import { AxiosError, AxiosResponse } from 'axios'
import { useMutation, useQueryClient } from 'react-query'
import client from 'api/client'

import {
  collectionEndpoint,
  queryKey,
  PerformanceCompetitionVariables,
  SerializedPerformanceCompetition,
  deserialize
} from './common'

const createEvent = (performanceCompetition: PerformanceCompetitionVariables) =>
  client.post<
    { performanceCompetition: PerformanceCompetitionVariables },
    AxiosResponse<SerializedPerformanceCompetition>
  >(collectionEndpoint, { performanceCompetition })

const useCreatePerformanceEventMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<
    AxiosResponse<SerializedPerformanceCompetition>,
    AxiosError<Record<string, string[]>>,
    PerformanceCompetitionVariables
  >(createEvent, {
    onSuccess(response) {
      queryClient.setQueryData(queryKey(response.data.id), deserialize(response.data))
    }
  })
}

export default useCreatePerformanceEventMutation
