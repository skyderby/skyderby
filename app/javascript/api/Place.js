import axios from 'axios'

const endpoint = '/api/v1/places'

const Place = {
  findRecord: async id => {
    const { data } = await axios.get(`${endpoint}/${id}`)

    return data
  },

  findAll: async ({ search, perPage = 25, page = 1 }) => {
    const url = `${endpoint}?search=${search}&perPage=${perPage}&page=${page}`
    const { data } = await axios.get(url)

    return data
  },

  pickAll: async ids => {
    const uniqueIds = Array.from(new Set(ids))

    const params = uniqueIds.reduce((acc, id) => {
      acc.append('ids[]', id)
      return acc
    }, new URLSearchParams())

    params.set('perPage', uniqueIds.length)

    const { data } = await axios.get(`${endpoint}?${params.toString()}`)

    return data
  }
}

export default Place
