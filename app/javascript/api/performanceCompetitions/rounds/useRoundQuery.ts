import useRoundsQuery from './useRoundsQuery'
import { Round } from './common'

const useRoundQuery = (eventId: number, id: number) =>
  useRoundsQuery<Round | undefined>(eventId, {
    select: data => data.find(round => round.id === id)
  })

export default useRoundQuery
