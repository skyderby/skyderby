import { QueryFunction, useQuery } from 'react-query'
import client from 'api/client'
import parseISO from 'date-fns/parseISO'
import { AxiosResponse } from 'axios'

type User = {
  id: number
  email: string
  signInCount: number
  currentSignInIp: string
  lastSignInIp: string
  currentSignInAt: Date | null
  lastSignInAt: Date | null
  name: string
  country: string
  trackCount: number
}

type SerializedUser = Omit<User, 'currentSignInAt' | 'lastSignInAt'> & {
  currentSignInAt: string | null
  lastSignInAt: string | null
}

type RecordQueryKey = ['users', number]

const recordUrl = (id: number) => `/api/v1/users/${id}`

const deserialize = (record: SerializedUser): User => ({
  ...record,
  currentSignInAt: record.currentSignInAt ? parseISO(record.currentSignInAt) : null,
  lastSignInAt: record.lastSignInAt ? parseISO(record.lastSignInAt) : null
})

const getUser = (id: number) =>
  client
    .get<never, AxiosResponse<SerializedUser>>(recordUrl(id))
    .then(response => response.data)

const queryFn: QueryFunction<User, RecordQueryKey> = async ctx => {
  const [_key, id] = ctx.queryKey
  const data = await getUser(id)

  return deserialize(data)
}

const useUserQuery = (id: number) =>
  useQuery({
    queryKey: ['users', id],
    queryFn
  })

export default useUserQuery
