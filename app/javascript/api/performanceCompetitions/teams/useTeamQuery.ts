import { UseQueryResult } from 'react-query'
import useTeamsQuery from './useTeamsQuery'
import { Team } from './common'

const useTeamQuery = (eventId: number, id: number): UseQueryResult<Team | undefined> =>
  useTeamsQuery<Team | undefined>(eventId, {
    select: (data: Team[]) => data.find(team => team.id === id)
  })

export default useTeamQuery
