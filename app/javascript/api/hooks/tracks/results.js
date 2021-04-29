import axios from 'axios'
import { useQuery } from 'react-query'

const getResults = async id => {
  const { data } = await axios.get(`/api/v1/tracks/${id}/results`)
  return data
}

const queryFn = ctx => {
  const [_key, id] = ctx.queryKey
  return getResults(id)
}

const getQueryOptions = id => ({
  queryKey: ['trackResults', id],
  queryFn,
  enabled: !!id
})

export const useTrackResults = id => useQuery(getQueryOptions(id))
