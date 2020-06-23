import axios from 'axios'

const endpoint = '/api/v1/suits'

const Suit = {
  findRecord: async id => {
    const { data } = await axios.get(`${endpoint}/${id}`)

    return data
  },

  findAll: async ({ search, perPage = 25, page }) => {
    const { data } = await axios.get(
      `${endpoint}?search=${search}&perPage=${perPage}&page=${page}}`
    )

    return data
  }
}

export default Suit
