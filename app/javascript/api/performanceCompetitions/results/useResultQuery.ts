import { useQuery, UseQueryResult } from 'react-query'

import useResultsQuery from './useResultsQuery'
import { Result } from './common'

const useResultQuery = (
  eventId: number,
  id: number
): UseQueryResult<Result | undefined> =>
  useResultsQuery<Result | undefined>(eventId, {
    select: data => data.find(result => result.id === id)
  })

export default useResultQuery
