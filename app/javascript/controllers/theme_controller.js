import { Controller } from '@hotwired/stimulus'

const COOKIE = 'theme'
const YEAR = 60 * 60 * 24 * 365

export default class extends Controller {
  static targets = ['option']

  connect() {
    this.markActive(document.documentElement.dataset.theme || 'system')
  }

  select({ params: { choice } }) {
    const root = document.documentElement

    if (choice === 'system') {
      delete root.dataset.theme
      document.cookie = `${COOKIE}=; path=/; max-age=0; samesite=lax`
    } else {
      root.dataset.theme = choice
      document.cookie = `${COOKIE}=${choice}; path=/; max-age=${YEAR}; samesite=lax`
    }

    this.markActive(choice)
    window.dispatchEvent(new CustomEvent('theme:change', { detail: { theme: choice } }))
  }

  sync({ detail: { theme } }) {
    this.markActive(theme)
  }

  markActive(choice) {
    this.optionTargets.forEach(option => {
      const active = option.dataset.themeChoiceParam === choice
      option.classList.toggle('active', active)
      option.setAttribute('aria-pressed', active)
    })
  }
}
