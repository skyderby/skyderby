import { UseSuspenseQueryResult } from '@tanstack/react-query'

import useResultsQuery from './useResultsQuery'
import { Result } from './common'

const useResultQuery = (
  eventId: number,
  id: number
): UseSuspenseQueryResult<Result | undefined> =>
  useResultsQuery<Result | undefined>(eventId, {
    select: data => data.find(result => result.id === id)
  })

export default useResultQuery
