import axios from 'axios'

const endpoint = '/api/v1/countries'

const Country = {
  async findRecord(id) {
    const { data } = await axios.get(`${endpoint}/${id}`)

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

export default Country
