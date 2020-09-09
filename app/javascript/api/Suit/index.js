import axios from 'axios'

import Popularity from './Popularity'
import Stats from './Stats'

const endpoint = '/api/v1/suits'

const Suit = {
  Popularity,
  Stats,

  findRecord: async id => {
    const { data } = await axios.get(`${endpoint}/${id}`)

    return data
  },

  findAll: async ({ search = '', perPage = 25, page = 1 } = {}) => {
    const { data } = await axios.get(
      `${endpoint}?search=${search}&perPage=${perPage}&page=${page}`
    )

    return data
  }
}

export default Suit
