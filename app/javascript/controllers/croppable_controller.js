import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['crop', 'preview', 'x', 'y', 'h', 'w', 'container']

  static values = {
    aspectRatio: { type: Number, default: 1 },
    minSize: { type: Number, default: 150 }
  }

  connect() {
    this.selection = { x: 0, y: 0, w: 200, h: 200 }
    this.isDragging = false
    this.isResizing = false
    this.dragStart = { x: 0, y: 0 }
    this.selectionStart = { x: 0, y: 0, w: 0, h: 0 }

    this.boundMouseMove = this.handleMouseMove.bind(this)
    this.boundMouseUp = this.handleMouseUp.bind(this)
    this.boundTouchMove = this.handleTouchMove.bind(this)
    this.boundTouchEnd = this.handleTouchEnd.bind(this)
  }

  disconnect() {
    this.removeEventListeners()
  }

  readFile(e) {
    const [file] = e.target.files
    if (!file || file === this.currentFile) return

    this.currentFile = file

    const reader = new FileReader()
    reader.onload = ({ target: { result } }) => {
      this.previewTarget.src = result
      this.cropTarget.src = result
      this.cropTarget.onload = () => this.initCrop()
    }

    reader.readAsDataURL(file)
  }

  initCrop() {
    this.createCropUI()
    this.constrainImageSize()
    this.initializeSelection()
    this.updateUI()
    this.updateCoordinates()
    this.updatePreview()
  }

  constrainImageSize() {
    const img = this.cropTarget

    img.style.width = ''
    img.style.height = ''

    this.imageWidth = img.offsetWidth
    this.imageHeight = img.offsetHeight
    this.scale = img.naturalWidth / this.imageWidth
  }

  initializeSelection() {
    const size = Math.min(200, this.imageWidth, this.imageHeight)
    this.selection = { x: 0, y: 0, w: size, h: size }
  }

  createCropUI() {
    if (this.cropOverlay) {
      this.cropOverlay.remove()
      this.selectionBox.remove()
    }

    const container = this.containerTarget
    container.style.position = 'relative'
    container.style.display = 'inline-block'

    this.cropOverlay = document.createElement('div')
    this.cropOverlay.className = 'crop-overlay'

    this.selectionBox = document.createElement('div')
    this.selectionBox.className = 'crop-selection'

    const handles = ['nw', 'ne', 'sw', 'se']
    handles.forEach(pos => {
      const handle = document.createElement('div')
      handle.className = `crop-handle crop-handle--${pos}`
      handle.dataset.handle = pos
      this.selectionBox.appendChild(handle)
    })

    container.appendChild(this.cropOverlay)
    container.appendChild(this.selectionBox)

    this.attachEventListeners()
  }

  attachEventListeners() {
    this.selectionBox.addEventListener(
      'mousedown',
      this.handleSelectionMouseDown.bind(this)
    )
    this.selectionBox.addEventListener(
      'touchstart',
      this.handleSelectionTouchStart.bind(this),
      {
        passive: false
      }
    )

    this.selectionBox.querySelectorAll('.crop-handle').forEach(handle => {
      handle.addEventListener('mousedown', this.handleHandleMouseDown.bind(this))
      handle.addEventListener('touchstart', this.handleHandleTouchStart.bind(this), {
        passive: false
      })
    })

    this.cropOverlay.addEventListener('mousedown', this.handleOverlayMouseDown.bind(this))
    this.cropOverlay.addEventListener(
      'touchstart',
      this.handleOverlayTouchStart.bind(this),
      {
        passive: false
      }
    )
  }

  removeEventListeners() {
    document.removeEventListener('mousemove', this.boundMouseMove)
    document.removeEventListener('mouseup', this.boundMouseUp)
    document.removeEventListener('touchmove', this.boundTouchMove)
    document.removeEventListener('touchend', this.boundTouchEnd)
  }

  handleOverlayMouseDown(e) {
    if (e.target !== this.cropOverlay) return

    const rect = this.cropOverlay.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    this.moveSelectionTo(x, y)
    this.startDrag(e.clientX, e.clientY)

    document.addEventListener('mousemove', this.boundMouseMove)
    document.addEventListener('mouseup', this.boundMouseUp)
  }

  handleOverlayTouchStart(e) {
    if (e.target !== this.cropOverlay) return
    e.preventDefault()

    const touch = e.touches[0]
    const rect = this.cropOverlay.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    this.moveSelectionTo(x, y)
    this.startDrag(touch.clientX, touch.clientY)

    document.addEventListener('touchmove', this.boundTouchMove, { passive: false })
    document.addEventListener('touchend', this.boundTouchEnd)
  }

  moveSelectionTo(x, y) {
    const halfSize = this.selection.w / 2
    let newX = x - halfSize
    let newY = y - halfSize

    newX = Math.max(0, Math.min(newX, this.imageWidth - this.selection.w))
    newY = Math.max(0, Math.min(newY, this.imageHeight - this.selection.h))

    this.selection.x = newX
    this.selection.y = newY

    this.updateUI()
    this.updateCoordinates()
    this.updatePreview()
  }

  handleSelectionMouseDown(e) {
    if (e.target.classList.contains('crop-handle')) return
    e.preventDefault()

    this.startDrag(e.clientX, e.clientY)

    document.addEventListener('mousemove', this.boundMouseMove)
    document.addEventListener('mouseup', this.boundMouseUp)
  }

  handleSelectionTouchStart(e) {
    if (e.target.classList.contains('crop-handle')) return
    e.preventDefault()

    const touch = e.touches[0]
    this.startDrag(touch.clientX, touch.clientY)

    document.addEventListener('touchmove', this.boundTouchMove, { passive: false })
    document.addEventListener('touchend', this.boundTouchEnd)
  }

  handleHandleMouseDown(e) {
    e.preventDefault()
    e.stopPropagation()

    this.startResize(e.clientX, e.clientY, e.target.dataset.handle)

    document.addEventListener('mousemove', this.boundMouseMove)
    document.addEventListener('mouseup', this.boundMouseUp)
  }

  handleHandleTouchStart(e) {
    e.preventDefault()
    e.stopPropagation()

    const touch = e.touches[0]
    this.startResize(touch.clientX, touch.clientY, e.target.dataset.handle)

    document.addEventListener('touchmove', this.boundTouchMove, { passive: false })
    document.addEventListener('touchend', this.boundTouchEnd)
  }

  startDrag(clientX, clientY) {
    this.isDragging = true
    this.dragStart = { x: clientX, y: clientY }
    this.selectionStart = { ...this.selection }
  }

  startResize(clientX, clientY, handle) {
    this.isResizing = true
    this.resizeHandle = handle
    this.dragStart = { x: clientX, y: clientY }
    this.selectionStart = { ...this.selection }
  }

  handleMouseMove(e) {
    e.preventDefault()
    this.handleMove(e.clientX, e.clientY)
  }

  handleTouchMove(e) {
    e.preventDefault()
    const touch = e.touches[0]
    this.handleMove(touch.clientX, touch.clientY)
  }

  handleMove(clientX, clientY) {
    const deltaX = clientX - this.dragStart.x
    const deltaY = clientY - this.dragStart.y

    if (this.isDragging) {
      this.drag(deltaX, deltaY)
    } else if (this.isResizing) {
      this.resize(deltaX, deltaY)
    }

    this.updateUI()
    this.updateCoordinates()
    this.updatePreview()
  }

  drag(deltaX, deltaY) {
    let newX = this.selectionStart.x + deltaX
    let newY = this.selectionStart.y + deltaY

    newX = Math.max(0, Math.min(newX, this.imageWidth - this.selection.w))
    newY = Math.max(0, Math.min(newY, this.imageHeight - this.selection.h))

    this.selection.x = newX
    this.selection.y = newY
  }

  resize(deltaX, deltaY) {
    const { x, y, w, h } = this.selectionStart
    const handle = this.resizeHandle
    const minSize = this.minSizeValue / this.scale

    let newX = x
    let newY = y
    let newSize = w

    if (handle === 'se') {
      const delta = Math.max(deltaX, deltaY)
      newSize = Math.max(minSize, w + delta)
      newSize = Math.min(newSize, this.imageWidth - x, this.imageHeight - y)
    } else if (handle === 'sw') {
      const delta = Math.max(-deltaX, deltaY)
      newSize = Math.max(minSize, w + delta)
      newSize = Math.min(newSize, x + w, this.imageHeight - y)
      newX = x + w - newSize
    } else if (handle === 'ne') {
      const delta = Math.max(deltaX, -deltaY)
      newSize = Math.max(minSize, w + delta)
      newSize = Math.min(newSize, this.imageWidth - x, y + h)
      newY = y + h - newSize
    } else if (handle === 'nw') {
      const delta = Math.max(-deltaX, -deltaY)
      newSize = Math.max(minSize, w + delta)
      newSize = Math.min(newSize, x + w, y + h)
      newX = x + w - newSize
      newY = y + h - newSize
    }

    this.selection = { x: newX, y: newY, w: newSize, h: newSize }
  }

  handleMouseUp() {
    this.isDragging = false
    this.isResizing = false
    this.removeEventListeners()
  }

  handleTouchEnd() {
    this.isDragging = false
    this.isResizing = false
    this.removeEventListeners()
  }

  updateUI() {
    const { x, y, w, h } = this.selection

    this.selectionBox.style.left = `${x}px`
    this.selectionBox.style.top = `${y}px`
    this.selectionBox.style.width = `${w}px`
    this.selectionBox.style.height = `${h}px`

    this.cropOverlay.style.width = `${this.imageWidth}px`
    this.cropOverlay.style.height = `${this.imageHeight}px`
  }

  updateCoordinates() {
    const { x, y, w, h } = this.selection
    const scale = this.scale

    this.xTarget.value = Math.round(x * scale)
    this.yTarget.value = Math.round(y * scale)
    this.wTarget.value = Math.round(w * scale)
    this.hTarget.value = Math.round(h * scale)
  }

  updatePreview() {
    const { x, y, w } = this.selection
    const previewSize = 150

    const styles = this.previewTarget.style
    styles.width = `${Math.round((previewSize / w) * this.imageWidth)}px`
    styles.height = `${Math.round((previewSize / w) * this.imageHeight)}px`
    styles.marginLeft = `-${Math.round((previewSize / w) * x)}px`
    styles.marginTop = `-${Math.round((previewSize / w) * y)}px`
  }
}
