'use server'

import client from 'api/client'
import { splitCookiesString } from 'next/dist/server/web/utils'
import { cookies } from 'next/headers'

type SuccessResult = {
  status: 'success'
}

type ErrorResult = {
  status: 'error'
  errors: {
    base?: string
  }
}

type User = {
  email: string
  password: string
  rememberMe: boolean
}

const parseSetCookieString = (setCookieString: string) => {
  const cookies = []

  for (const cookie of splitCookiesString(setCookieString)) {
    const [pair, ...rest] = cookie.split('; ')
    const [name, value] = pair.split('=')
    const options = Object.fromEntries(rest.map(option => option.split('=')))
    if (options.expires) options.expires = new Date(options.expires)

    cookies.push({ name, value, options })
  }

  return cookies
}

async function signIn(user: User): Promise<SuccessResult | ErrorResult> {
  const csrfResponse = await client.get('/api/csrf')
  const { csrf } = await csrfResponse.json()

  const response = await client.post(
    '/api/users/sign_in',
    { user: { ...user, remember_me: true } },
    {
      headers: {
        'X-CSRF-Token': String(csrf),
        cookie: csrfResponse.headers.get('set-cookie') ?? undefined
      }
    }
  )

  if (response.ok) {
    if (response.headers.has('set-cookie')) {
      const cookiesToSet = parseSetCookieString(response.headers.get('set-cookie') ?? '')
      cookiesToSet.forEach(entry => cookies().set(entry.name, entry.value, entry.options))
    }

    if (response.headers.has('new-csrf-token')) {
      response.headers.get('new-csrf-token')
      cookies().set('_next_session_token', response.headers.get('new-csrf-token') ?? '', {
        httpOnly: true
      })
    }

    return { status: 'success' }
  } else {
    if (response.status === 401) {
      const { error } = await response.json()
      return {
        status: 'error',
        errors: {
          base: error
        }
      }
    }

    return { status: 'error', errors: { base: 'Unknown error' } }
  }
}

export default signIn
