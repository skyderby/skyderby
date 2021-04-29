import axios from 'axios'

const endpoint = '/api/v1/performance_competitions'

const Rounds = {
  findAll: async eventId => {
    const { data } = await axios.get(`${endpoint}/${eventId}/rounds`)

    return data
  }
}

export default Rounds
