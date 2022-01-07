import { useQuery, UseQueryResult } from 'react-query'
import client from 'api/client'

export interface SuitsPopularityRecord {
  suitId: number
  popularity: number
}

const endpoint = '/api/v1/suits/popularity'

const getPopularity = () => client.get(endpoint).then(response => response.data)

export const useSuitPopularityQuery = (): UseQueryResult<SuitsPopularityRecord[]> =>
  useQuery({
    queryKey: ['suitPopularity'] as const,
    queryFn: getPopularity
  })
