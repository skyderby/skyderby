import { QueryFunctionContext, useSuspenseQuery } from '@tanstack/react-query'
import client from 'api/client'
import { elementEndpoint, QueryKey, queryKey, tournamentSchema } from './common'

const getTournament = (id: number) =>
  client.get(elementEndpoint(id)).then(response => tournamentSchema.parse(response.data))

const queryFn = async (ctx: QueryFunctionContext<QueryKey>) => {
  const [_key, id] = ctx.queryKey

  return getTournament(id)
}

const useTournamentSuspenseQuery = (id: number) => {
  return useSuspenseQuery({
    queryKey: queryKey(id),
    queryFn
  })
}

export default useTournamentSuspenseQuery
