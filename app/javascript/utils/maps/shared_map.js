const instances = new Map()

const detachOverlay = overlay => {
  if (typeof overlay.setMap === 'function') {
    overlay.setMap(null)
  } else {
    overlay.map = null
  }
}

class SharedMapHandle {
  constructor(entry) {
    this.entry = entry
    this.overlays = []
  }

  get map() {
    return this.entry.map
  }

  add(overlay) {
    this.overlays.push(overlay)
    return overlay
  }

  clear() {
    this.overlays.forEach(detachOverlay)
    this.overlays = []
  }

  release() {
    this.clear()

    if (this.entry.handle !== this) return

    this.entry.host.remove()
    this.entry.handle = null
  }
}

export const acquireMap = (container, key, options) => {
  let entry = instances.get(key)

  if (entry) {
    entry.handle?.clear()
  } else {
    const host = document.createElement('div')
    host.dataset.sharedMap = key
    host.style.width = '100%'
    host.style.height = '100%'
    entry = { host, map: new google.maps.Map(host, options) }
    instances.set(key, entry)
  }

  container.appendChild(entry.host)
  entry.handle = new SharedMapHandle(entry)

  return entry.handle
}
