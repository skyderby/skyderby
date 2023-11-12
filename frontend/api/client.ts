import { cookies } from 'next/headers'

async function client(path: string, config?: RequestInit) {
  const cookie = cookies()
  const session = cookie.get('_skyderby_session')?.value
  const csrfToken = cookie.get('_next_session_token')?.value
  const method = config?.method || 'GET'

  const configWithCredentials = {
    ...config,
    headers: {
      ...(method !== 'GET' ? { 'X-CSRF-Token': csrfToken } : {}),
      Accept: 'application/json',
      'Content-Type': 'application/json',
      cookie: `_skyderby_session=${session}`,
      ...config?.headers
    }
  }

  return fetch(process.env.BACKEND_URL + path, configWithCredentials)
}

client.get = (path: string, config?: RequestInit) =>
  client(path, { ...config, method: 'GET' })

client.post = <TData>(path: string, data: TData, config?: RequestInit) =>
  client(path, { ...config, body: JSON.stringify(data), method: 'POST' })

client.delete = (path: string, config?: RequestInit) =>
  client(path, { ...config, method: 'DELETE' })

export default client
