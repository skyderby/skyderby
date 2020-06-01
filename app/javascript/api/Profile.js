import axios from 'axios'

const endpoint = '/api/v1/profiles'

const Profile = {
  findRecord: async id => {
    const { data } = await axios.get(`${endpoint}/${id}`)

    return data
  },

  findAll: async ({ search, perPage = 25, page = 1 }) => {
    const url = `${endpoint}?search=${search}&perPage=${perPage}&page=${page}}`
    const { data } = await axios.get(url)

    return data
  }
}

export default Profile
