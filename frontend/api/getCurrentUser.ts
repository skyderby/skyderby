import client from 'api/client'

const getCurrentUser = async () => {
  const currentUser = await client.get('/api/v1/current_user').then(res => res.json())

  return currentUser
}

export default getCurrentUser
