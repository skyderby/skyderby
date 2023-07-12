import client from 'api/client'
import { cookies } from 'next/headers'
import { splitCookiesString } from 'next/dist/server/web/utils'

async function logout() {
  'use server'

  const cookie = `_skyderby_session=${cookies().get('_skyderby_session')?.value}`

  await client
    .delete('/api/users/sign_out', {
      headers: {
        Accept: 'application/json',
        'X-CSRF-Token': cookies().get('_next_session_token')?.value ?? '',
        cookie
      }
    })
    .then(async response => {
      if (response.ok) {
        if (response.headers.has('set-cookie')) {
          for (const cookie of splitCookiesString(
            response.headers.get('set-cookie') ?? ''
          )) {
            const [pair, ...rest] = cookie.split('; ')
            const [name, value] = pair.split('=')
            const options = Object.fromEntries(rest.map(option => option.split('=')))
            if (options.expires) options.expires = new Date(options.expires)

            cookies().set(name, value, options)
          }
        }

        if (response.headers.has('new-csrf-token')) {
          cookies().set(
            '_next_session_token',
            response.headers.get('new-csrf-token') ?? '',
            {
              httpOnly: true
            }
          )
        }
      }
    })
}

export default logout
