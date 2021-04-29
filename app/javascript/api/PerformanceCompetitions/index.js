import axios from 'axios'

import Categories from './Categories'
import Competitors from './Competitors'
import Rounds from './Rounds'
import Standings from './Standings'

const endpoint = '/api/v1/performance_competitions'

const Index = {
  Categories,
  Competitors,
  Rounds,
  Standings,

  findRecord: async id => {
    const { data } = await axios.get(`${endpoint}/${id}`)

    return data
  }
}

export default Index
