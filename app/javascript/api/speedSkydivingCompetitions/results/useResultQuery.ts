import { UseQueryResult } from 'react-query'
import { Result } from './common'
import useResultsQuery from './useResultsQuery'

const useResultQuery = (
  eventId: number,
  id: number
): UseQueryResult<Result | undefined> =>
  useResultsQuery<Result | undefined>(eventId, {
    select: (data: Result[]) => data.find(result => result.id === id)
  })

export default useResultQuery
