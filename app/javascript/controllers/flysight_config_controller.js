import { Controller } from '@hotwired/stimulus'

export default class FlysightConfigController extends Controller {
  static targets = ['name', 'content', 'text', 'error']

  async connect() {
    const params = new URLSearchParams(window.location.hash.slice(1))
    try {
      this.config = await this.inflate(params.get('c'))
    } catch {
      this.errorTarget.hidden = false
      return
    }
    this.nameTarget.textContent = params.get('n') || ''
    this.textTarget.textContent = this.config
    this.contentTarget.hidden = false
  }

  async inflate(encoded) {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0))
    const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream('deflate-raw'))
    return new Response(stream).text()
  }

  download() {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(
      new Blob([this.config + '\n'], { type: 'text/plain' })
    )
    link.download = 'CONFIG.TXT'
    link.click()
    URL.revokeObjectURL(link.href)
  }
}
