import axios from 'axios'

const endpoint = '/api/v1/tracks/files'

const TrackFile = {
  createRecord: async file => {
    const formData = new FormData()

    formData.append('file', file)

    const { data } = await axios.post(endpoint, formData)

    return data
  }
}

export default TrackFile
