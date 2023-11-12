import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { splitCookiesString } from 'next/dist/server/web/utils'

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

export async function middleware(request: NextRequest) {
  if (
    !request.cookies.has('_skyderby_session') &&
    request.cookies.has('remember_user_token')
  ) {
    const response = NextResponse.redirect(request.url)
    const csrfResponse = await fetch(process.env.BACKEND_URL + '/api/csrf', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        cookie: `remember_user_token=${request.cookies.get('remember_user_token')?.value}`
      }
    })

    if (csrfResponse.headers.has('set-cookie')) {
      const cookiesToSet = parseSetCookieString(
        csrfResponse.headers.get('set-cookie') ?? ''
      )
      cookiesToSet.forEach(entry => {
        response.cookies.set(entry.name, entry.value, entry.options)
      })
    }

    const { csrf } = await csrfResponse.json()
    response.cookies.set('_next_session_token', csrf ?? '')

    return response
  }
}
