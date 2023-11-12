import { QueryFunction, useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import parseISO from 'date-fns/parseISO'
import client from 'api/client'
import {
  elementEndpoint,
  recordQueryKey,
  SerializedUser,
  UserWithDetails as User
} from './common'

type RecordQueryKey = readonly ['users', number]

const deserialize = (record: SerializedUser): User => ({
  ...record,
  currentSignInAt: record.currentSignInAt ? parseISO(record.currentSignInAt) : null,
  lastSignInAt: record.lastSignInAt ? parseISO(record.lastSignInAt) : null
})

const getUser = (id: number) =>
  client
    .get<never, AxiosResponse<SerializedUser>>(elementEndpoint(id))
    .then(response => response.data)

const queryFn: QueryFunction<User, RecordQueryKey> = async ctx => {
  const [_key, id] = ctx.queryKey
  const data = await getUser(id)

  return deserialize(data)
}

const useUserQuery = (id: number) =>
  useQuery({
    queryKey: recordQueryKey(id),
    queryFn
  })

export default useUserQuery
