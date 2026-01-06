import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    this.clientId = document.querySelector('meta[name="google-client-id"]')?.content
    if (!this.clientId) return

    this.loadGoogleScript()
  }

  loadGoogleScript() {
    if (window.google?.accounts) {
      this.initializeOneTap()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => this.initializeOneTap()
    document.head.appendChild(script)
  }

  initializeOneTap() {
    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: true,
      cancel_on_tap_outside: false
    })

    window.google.accounts.id.prompt()
  }

  async handleCredentialResponse(response) {
    try {
      const result = await fetch('/google_one_tap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ credential: response.credential })
      })

      if (result.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Google One Tap error:', error)
    }
  }
}
