import { useQuery, UseQueryResult } from 'react-query'
import axios from 'axios'

export interface SuitsPopularityRecord {
  suitId: number
  popularity: number
}

const endpoint = '/api/v1/suits/popularity'

const getPopularity = () => axios.get(endpoint).then(response => response.data)

export const useSuitPopularityQuery = (): UseQueryResult<SuitsPopularityRecord[]> =>
  useQuery({
    queryKey: ['suitPopularity'] as const,
    queryFn: getPopularity
  })
