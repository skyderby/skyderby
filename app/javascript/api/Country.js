import axios from 'axios'

const endpoint = '/api/v1/country'

const Country = {
  async findRecord(id) {
    const { data } = await axios.get(`${endpoint}/${id}`)

    return data
  }
}

export default Country
