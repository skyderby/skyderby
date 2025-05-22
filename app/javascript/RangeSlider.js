class RangeSlider {
  static pluginCount = 0
  static currentSlider = null

  constructor(element, options = {}) {
    if (element.dataset.isActive) {
      return
    }

    this.element = element
    this.pluginCount = ++RangeSlider.pluginCount
    this.element.dataset.isActive = 'true'

    this.settings = this.mergeSettings(options)
    this.parseDataAttributes()
    this.validateSettings()

    this.container = null
    this.sliders = {}
    this.fields = {}
    this.numbers = {}
    this.dimensions = {}
    this.isDragging = false
    this.isActive = false
    this.firstStart = true
    this.activeSlider = null

    this.init()
  }

  mergeSettings(options) {
    const defaults = {
      min: null,
      max: null,
      from: null,
      to: null,
      type: 'single',
      step: null,
      prefix: '',
      postfix: '',
      maxPostfix: '',
      hasGrid: false,
      hideMinMax: false,
      hideFromTo: false,
      prettify: true,
      disable: false,
      values: null,
      onChange: null,
      onLoad: null,
      onFinish: null
    }

    return Object.assign(defaults, options)
  }

  parseDataAttributes() {
    const { dataset } = this.element

    ;['min', 'max', 'from', 'to', 'step'].forEach(attr => {
      if (dataset[attr] !== undefined) {
        this.settings[attr] = parseFloat(dataset[attr])
      }
    })
    ;['type', 'prefix', 'postfix', 'maxpostfix'].forEach(attr => {
      if (dataset[attr] !== undefined) {
        this.settings[attr === 'maxpostfix' ? 'maxPostfix' : attr] = dataset[attr]
      }
    })
    ;['hasgrid', 'hideminmax', 'hidefromto', 'prettify', 'disable'].forEach(attr => {
      if (dataset[attr] !== undefined) {
        const camelCase = attr.replace(
          /([a-z])([a-z])/g,
          (match, p1, p2) => p1 + p2.charAt(0).toUpperCase() + p2.slice(1)
        )
        this.settings[camelCase] = dataset[attr] === 'true'
      }
    })

    if (dataset.values) {
      this.settings.values = dataset.values.split(',')
    }

    if (this.element.value) {
      const valueArray = this.element.value.split(';')
      this.parseInitialValues(valueArray)
    }
  }

  parseInitialValues(valueArray) {
    if (this.settings.type === 'single') {
      if (valueArray.length > 1) {
        if (typeof this.settings.min !== 'number') {
          this.settings.min = parseFloat(valueArray[0])
        } else if (typeof this.settings.from !== 'number') {
          this.settings.from = parseFloat(valueArray[0])
        }

        if (typeof this.settings.max !== 'number') {
          this.settings.max = parseFloat(valueArray[1])
        }
      } else if (valueArray.length === 1 && typeof this.settings.from !== 'number') {
        this.settings.from = parseFloat(valueArray[0])
      }
    } else if (this.settings.type === 'double') {
      if (valueArray.length > 1) {
        if (typeof this.settings.min !== 'number') {
          this.settings.min = parseFloat(valueArray[0])
        } else if (typeof this.settings.from !== 'number') {
          this.settings.from = parseFloat(valueArray[0])
        }

        if (typeof this.settings.max !== 'number') {
          this.settings.max = parseFloat(valueArray[1])
        } else if (typeof this.settings.to !== 'number') {
          this.settings.to = parseFloat(valueArray[1])
        }
      } else if (valueArray.length === 1) {
        if (typeof this.settings.min !== 'number') {
          this.settings.min = parseFloat(valueArray[0])
        } else if (typeof this.settings.from !== 'number') {
          this.settings.from = parseFloat(valueArray[0])
        }
      }
    }
  }

  validateSettings() {
    this.settings.min = this.testNumber(this.settings.min) ?? 10
    this.settings.max = this.testNumber(this.settings.max) ?? 100

    if (Array.isArray(this.settings.values) && this.settings.values.length > 0) {
      this.settings.min = 0
      this.settings.max = this.settings.values.length - 1
      this.settings.step = 1
      this.allowValues = true
    }

    this.settings.from = this.testNumber(this.settings.from) ?? this.settings.min
    this.settings.to = this.testNumber(this.settings.to) ?? this.settings.max
    this.settings.step = this.testNumber(this.settings.step) ?? 1

    this.fixRange()
    this.calculateStepFloat()
  }

  testNumber(num) {
    if (typeof num === 'number') {
      return isNaN(num) ? null : num
    }

    const parsed = parseFloat(num)
    return isNaN(parsed) ? null : parsed
  }

  fixRange() {
    if (this.settings.min < this.settings.max) {
      this.settings.from = Math.max(
        this.settings.min,
        Math.min(this.settings.max, this.settings.from)
      )
      this.settings.to = Math.max(
        this.settings.min,
        Math.min(this.settings.max, this.settings.to)
      )

      if (this.settings.type === 'double') {
        if (this.settings.from > this.settings.to) {
          this.settings.from = this.settings.to
        }
        if (this.settings.to < this.settings.from) {
          this.settings.to = this.settings.from
        }
      }
    } else {
      this.settings.from = Math.max(
        this.settings.max,
        Math.min(this.settings.min, this.settings.from)
      )
      this.settings.to = Math.max(
        this.settings.max,
        Math.min(this.settings.min, this.settings.to)
      )

      if (this.settings.type === 'double') {
        if (this.settings.from < this.settings.to) {
          this.settings.from = this.settings.to
        }
        if (this.settings.to > this.settings.from) {
          this.settings.to = this.settings.from
        }
      }
    }
  }

  calculateStepFloat() {
    this.stepFloat = 0
    if (parseInt(this.settings.step, 10) !== parseFloat(this.settings.step)) {
      const stepStr = this.settings.step.toString()
      const decimalPart = stepStr.split('.')[1]
      if (decimalPart) {
        this.stepFloat = Math.pow(10, decimalPart.length)
      }
    }
  }

  init() {
    this.createContainer()
    this.createHTML()
    this.cacheElements()
    this.bindEvents()
    this.calculateDimensions()
    this.setInitialPositions()

    if (this.settings.hasGrid) {
      this.createGrid()
    }

    if (this.settings.disable) {
      this.setDisabled(true)
    }

    this.callCallback('onLoad')
    this.firstStart = false
  }

  createContainer() {
    const containerHTML = `<span class="irs" id="irs-${this.pluginCount}"></span>`
    this.element.style.display = 'none'
    this.element.insertAdjacentHTML('beforebegin', containerHTML)
    this.container = this.element.previousElementSibling
  }

  createHTML() {
    const baseHTML = `
      <span class="irs">
        <span class="irs-line">
          <span class="irs-line-left"></span>
          <span class="irs-line-mid"></span>
          <span class="irs-line-right"></span>
        </span>
        <span class="irs-min">0</span>
        <span class="irs-max">1</span>
        <span class="irs-from">0</span>
        <span class="irs-to">0</span>
        <span class="irs-single">0</span>
      </span>
      <span class="irs-grid"></span>
    `

    this.container.innerHTML = baseHTML

    if (this.settings.type === 'single') {
      const singleHTML = '<span class="irs-slider single"></span>'
      this.container.querySelector('.irs').insertAdjacentHTML('beforeend', singleHTML)
    } else {
      const doubleHTML = `
        <span class="irs-diapason"></span>
        <span class="irs-slider from"></span>
        <span class="irs-slider to"></span>
      `
      this.container.querySelector('.irs').insertAdjacentHTML('beforeend', doubleHTML)
    }
  }

  cacheElements() {
    const rangeSlider = this.container.querySelector('.irs')

    this.fields = {
      min: rangeSlider.querySelector('.irs-min'),
      max: rangeSlider.querySelector('.irs-max'),
      from: rangeSlider.querySelector('.irs-from'),
      to: rangeSlider.querySelector('.irs-to'),
      single: rangeSlider.querySelector('.irs-single')
    }

    this.sliders = {}
    if (this.settings.type === 'single') {
      this.sliders.single = rangeSlider.querySelector('.irs-slider.single')
    } else {
      this.sliders.from = rangeSlider.querySelector('.irs-slider.from')
      this.sliders.to = rangeSlider.querySelector('.irs-slider.to')
      this.sliders.diapason = rangeSlider.querySelector('.irs-diapason')
    }

    this.grid = this.container.querySelector('.irs-grid')
    this.rangeSlider = rangeSlider

    this.setupFieldVisibility()
    this.updateMinMaxFields()
  }

  setupFieldVisibility() {
    const visibility = this.settings.hideFromTo ? 'hidden' : 'visible'
    this.fields.from.style.visibility = visibility
    this.fields.to.style.visibility = visibility
    this.fields.single.style.visibility = visibility

    const minMaxVisibility = this.settings.hideMinMax ? 'hidden' : 'visible'
    this.fields.min.style.visibility = minMaxVisibility
    this.fields.max.style.visibility = minMaxVisibility
  }

  updateMinMaxFields() {
    if (!this.settings.hideMinMax) {
      if (this.settings.values) {
        this.fields.min.textContent =
          this.settings.prefix + this.settings.values[0] + this.settings.postfix
        this.fields.max.textContent =
          this.settings.prefix +
          this.settings.values[this.settings.values.length - 1] +
          this.settings.maxPostfix +
          this.settings.postfix
      } else {
        this.fields.min.textContent =
          this.settings.prefix + this.prettify(this.settings.min) + this.settings.postfix
        this.fields.max.textContent =
          this.settings.prefix +
          this.prettify(this.settings.max) +
          this.settings.maxPostfix +
          this.settings.postfix
      }
    }
  }

  bindEvents() {
    if (this.settings.type === 'single') {
      this.bindSliderEvents(this.sliders.single, null)
    } else {
      this.bindSliderEvents(this.sliders.from, 'from')
      this.bindSliderEvents(this.sliders.to, 'to')
    }

    this.container.addEventListener('pointerdown', this.handleContainerClick.bind(this))

    document.addEventListener('pointermove', this.handlePointerMove.bind(this))
    document.addEventListener('pointerup', this.handlePointerUp.bind(this))
  }

  bindSliderEvents(slider, type) {
    slider.addEventListener('pointerdown', e => {
      e.preventDefault()
      e.stopPropagation()

      this.startDrag(e, slider, type)
    })
  }

  startDrag(e, slider, type) {
    if (type === 'from') {
      slider.classList.add('last')
      this.sliders.to.classList.remove('last')
    } else if (type === 'to') {
      slider.classList.add('last')
      this.sliders.from.classList.remove('last')
    }

    this.calculateDragDimensions(e, slider, type)
    this.isDragging = true
    this.isActive = true
    this.activeSlider = slider
    this.activeSliderType = type
    RangeSlider.currentSlider = this

    slider.id = 'irs-active-slider'
  }

  calculateDragDimensions(e, slider, type) {
    this.calculateDimensions()
    this.firstStart = false

    const sliderRect = slider.getBoundingClientRect()
    const clickOffset = e.clientX - sliderRect.left
    this.minusX = sliderRect.left + clickOffset - slider.offsetLeft

    if (this.settings.type === 'single') {
      this.dimensions.width = this.rangeSlider.offsetWidth - slider.offsetWidth
    } else {
      if (type === 'from') {
        this.dimensions.left = 0
        this.dimensions.right = parseInt(this.sliders.to.style.left || '0', 10)
      } else {
        this.dimensions.left = parseInt(this.sliders.from.style.left || '0', 10)
        this.dimensions.right = this.rangeSlider.offsetWidth - slider.offsetWidth
      }
    }
  }

  handlePointerMove(e) {
    if (this.isDragging && RangeSlider.currentSlider === this) {
      this.dragSlider(e.clientX)
    }
  }

  handlePointerUp() {
    if (RangeSlider.currentSlider !== this) return

    if (this.isDragging) {
      this.isActive = false
      this.isDragging = false

      if (this.activeSlider) {
        this.activeSlider.removeAttribute('id')
        this.activeSlider = null
      }

      if (this.settings.type === 'double') {
        this.updateDiapason()
      }

      this.updateNumbers()
      this.callCallback('onFinish')
    }
  }

  handleContainerClick(e) {
    RangeSlider.currentSlider = this

    if (this.isDragging || this.settings.disable) return

    const containerRect = this.container.getBoundingClientRect()
    const clickX = e.clientX - containerRect.left
    this.moveByClick(clickX)
  }

  moveByClick(clickX) {
    this.firstStart = false

    const sliderWidth =
      this.settings.type === 'single'
        ? this.sliders.single.offsetWidth
        : this.sliders.from.offsetWidth

    this.dimensions.left = 0
    this.dimensions.width = this.rangeSlider.offsetWidth - sliderWidth
    this.dimensions.right = this.rangeSlider.offsetWidth - sliderWidth

    if (this.settings.type === 'single') {
      this.activeSlider = this.sliders.single
      this.activeSlider.id = 'irs-active-slider'
      this.dragSlider(clickX, true)
    } else {
      const fromX = this.getSliderPosition(this.sliders.from)
      const toX = this.getSliderPosition(this.sliders.to)
      const zeroPoint = fromX + (toX - fromX) / 2

      if (clickX <= zeroPoint) {
        this.activeSlider = this.sliders.from
        this.activeSliderType = 'from'
      } else {
        this.activeSlider = this.sliders.to
        this.activeSliderType = 'to'
      }

      this.activeSlider.id = 'irs-active-slider'
      this.dragSlider(clickX, true)
      this.updateDiapason()
    }

    this.activeSlider.removeAttribute('id')
    this.activeSlider = null
  }

  dragSlider(mouseX, isClick = false) {
    let xPure = isClick ? mouseX : mouseX - this.minusX

    if (this.settings.type === 'single') {
      xPure = Math.max(0, Math.min(this.dimensions.width, xPure))
    } else {
      xPure = Math.max(this.dimensions.left, Math.min(this.dimensions.right, xPure))
      this.updateDiapason()
    }

    this.setSliderPosition(this.activeSlider, xPure)
    this.updateNumbers()
  }

  setSliderPosition(slider, position) {
    slider.dataset.x = position.toString()
    slider.style.left = Math.round(position) + 'px'
  }

  getSliderPosition(slider) {
    return (
      parseFloat(slider.dataset.x) || parseInt(slider.style.left, 10) || slider.offsetLeft
    )
  }

  updateDiapason() {
    if (this.settings.type !== 'double') return

    const sliderWidth = this.sliders.from.offsetWidth
    const fromX = this.getSliderPosition(this.sliders.from)
    const toX = this.getSliderPosition(this.sliders.to)

    const x = fromX + sliderWidth / 2
    const width = toX - fromX

    this.sliders.diapason.style.left = x + 'px'
    this.sliders.diapason.style.width = width + 'px'
  }

  calculateDimensions() {
    this.dimensions.normalWidth = this.rangeSlider.offsetWidth

    if (this.settings.type === 'single') {
      this.dimensions.sliderWidth = this.sliders.single.offsetWidth
    } else {
      this.dimensions.sliderWidth = this.sliders.from.offsetWidth
    }

    this.dimensions.fullWidth = this.dimensions.normalWidth - this.dimensions.sliderWidth

    if (!this.settings.hideMinMax) {
      this.dimensions.fieldMinWidth = this.fields.min.offsetWidth
      this.dimensions.fieldMaxWidth = this.fields.max.offsetWidth
    } else {
      this.dimensions.fieldMinWidth = 0
      this.dimensions.fieldMaxWidth = 0
    }
  }

  updateNumbers() {
    const diapason = this.settings.max - this.settings.min

    this.numbers = {
      input: this.element,
      slider: this.container,
      min: this.settings.min,
      max: this.settings.max,
      fromNumber: 0,
      toNumber: 0,
      fromPers: 0,
      toPers: 0,
      fromX: 0,
      toX: 0
    }

    if (this.settings.type === 'single') {
      this.numbers.fromX = this.getSliderPosition(this.sliders.single)
      this.numbers.fromPers = (this.numbers.fromX / this.dimensions.fullWidth) * 100

      let from = (diapason / 100) * this.numbers.fromPers + this.settings.min
      this.numbers.fromNumber = Math.round(from / this.settings.step) * this.settings.step

      this.numbers.fromNumber = this.clampValue(this.numbers.fromNumber)

      if (this.stepFloat) {
        this.numbers.fromNumber =
          parseInt(this.numbers.fromNumber * this.stepFloat, 10) / this.stepFloat
      }

      if (this.allowValues) {
        this.numbers.fromValue = this.settings.values[this.numbers.fromNumber]
      }
    } else {
      this.numbers.fromX = this.getSliderPosition(this.sliders.from)
      this.numbers.fromPers = (this.numbers.fromX / this.dimensions.fullWidth) * 100

      let from = (diapason / 100) * this.numbers.fromPers + this.settings.min
      this.numbers.fromNumber = Math.round(from / this.settings.step) * this.settings.step
      this.numbers.fromNumber = this.clampValue(this.numbers.fromNumber)

      this.numbers.toX = this.getSliderPosition(this.sliders.to)
      this.numbers.toPers = (this.numbers.toX / this.dimensions.fullWidth) * 100

      let to = (diapason / 100) * this.numbers.toPers + this.settings.min
      this.numbers.toNumber = Math.round(to / this.settings.step) * this.settings.step
      this.numbers.toNumber = this.clampValue(this.numbers.toNumber)

      if (this.stepFloat) {
        this.numbers.fromNumber =
          parseInt(this.numbers.fromNumber * this.stepFloat, 10) / this.stepFloat
        this.numbers.toNumber =
          parseInt(this.numbers.toNumber * this.stepFloat, 10) / this.stepFloat
      }

      if (this.allowValues) {
        this.numbers.fromValue = this.settings.values[this.numbers.fromNumber]
        this.numbers.toValue = this.settings.values[this.numbers.toNumber]
      }
    }

    this.updateFields()
  }

  clampValue(value) {
    if (this.settings.min < this.settings.max) {
      return Math.max(this.settings.min, Math.min(this.settings.max, value))
    } else {
      return Math.max(this.settings.max, Math.min(this.settings.min, value))
    }
  }

  setInitialPositions() {
    const diapason = this.settings.max - this.settings.min

    if (this.settings.type === 'single') {
      const fromPers =
        diapason !== 0 ? ((this.settings.from - this.settings.min) / diapason) * 100 : 0
      const fromX = (this.dimensions.fullWidth / 100) * fromPers

      this.sliders.single.style.left = Math.round(fromX) + 'px'
      this.sliders.single.dataset.x = fromX.toString()
    } else {
      const fromPers =
        diapason !== 0 ? ((this.settings.from - this.settings.min) / diapason) * 100 : 0
      const fromX = (this.dimensions.fullWidth / 100) * fromPers

      this.sliders.from.style.left = Math.round(fromX) + 'px'
      this.sliders.from.dataset.x = fromX.toString()

      const toPers =
        diapason !== 0 ? ((this.settings.to - this.settings.min) / diapason) * 100 : 100
      const toX = (this.dimensions.fullWidth / 100) * toPers

      this.sliders.to.style.left = Math.round(toX) + 'px'
      this.sliders.to.dataset.x = toX.toString()

      this.updateDiapason()

      if (this.settings.to === this.settings.max) {
        this.sliders.from.classList.add('last')
      }
    }

    this.updateNumbers()
  }

  updateFields() {
    const sliderWidth = this.dimensions.sliderWidth / 2
    const normalWidth = this.dimensions.normalWidth

    if (this.settings.type === 'single') {
      const maxPostfix =
        this.numbers.fromNumber === this.settings.max ? this.settings.maxPostfix : ''

      this.fields.from.style.display = 'none'
      this.fields.to.style.display = 'none'

      const singleText = this.allowValues
        ? this.settings.prefix +
          this.settings.values[this.numbers.fromNumber] +
          maxPostfix +
          this.settings.postfix
        : this.settings.prefix +
          this.prettify(this.numbers.fromNumber) +
          maxPostfix +
          this.settings.postfix

      this.fields.single.textContent = singleText

      const singleWidth = this.fields.single.offsetWidth
      let singleX = this.numbers.fromX - singleWidth / 2 + sliderWidth
      singleX = Math.max(0, Math.min(normalWidth - singleWidth, singleX))
      this.fields.single.style.left = singleX + 'px'

      if (!this.settings.hideMinMax && !this.settings.hideFromTo) {
        this.fields.min.style.display =
          singleX < this.dimensions.fieldMinWidth ? 'none' : 'block'
        this.fields.max.style.display =
          singleX + singleWidth > normalWidth - this.dimensions.fieldMaxWidth
            ? 'none'
            : 'block'
      }

      this.element.value = this.numbers.fromNumber.toString()
    } else {
      const fromMaxPostfix =
        this.numbers.fromNumber === this.settings.max ? this.settings.maxPostfix : ''
      const toMaxPostfix =
        this.numbers.toNumber === this.settings.max ? this.settings.maxPostfix : ''

      const fromText = this.allowValues
        ? this.settings.prefix +
          this.settings.values[this.numbers.fromNumber] +
          this.settings.postfix
        : this.settings.prefix +
          this.prettify(this.numbers.fromNumber) +
          this.settings.postfix

      const toText = this.allowValues
        ? this.settings.prefix +
          this.settings.values[this.numbers.toNumber] +
          toMaxPostfix +
          this.settings.postfix
        : this.settings.prefix +
          this.prettify(this.numbers.toNumber) +
          toMaxPostfix +
          this.settings.postfix

      const singleText =
        this.numbers.fromNumber !== this.numbers.toNumber
          ? fromText + ' — ' + toText
          : this.allowValues
            ? this.settings.prefix +
              this.settings.values[this.numbers.fromNumber] +
              toMaxPostfix +
              this.settings.postfix
            : this.settings.prefix +
              this.prettify(this.numbers.fromNumber) +
              toMaxPostfix +
              this.settings.postfix

      this.fields.from.textContent = fromText
      this.fields.to.textContent = toText
      this.fields.single.textContent = singleText

      const fromWidth = this.fields.from.offsetWidth
      let fromX = this.numbers.fromX - fromWidth / 2 + sliderWidth
      fromX = Math.max(0, Math.min(normalWidth - fromWidth, fromX))
      this.fields.from.style.left = fromX + 'px'

      const toWidth = this.fields.to.offsetWidth
      let toX = this.numbers.toX - toWidth / 2 + sliderWidth
      toX = Math.max(0, Math.min(normalWidth - toWidth, toX))
      this.fields.to.style.left = toX + 'px'

      const singleWidth = this.fields.single.offsetWidth
      let singleX =
        this.numbers.fromX +
        (this.numbers.toX - this.numbers.fromX) / 2 -
        singleWidth / 2 +
        sliderWidth
      singleX = Math.max(0, Math.min(normalWidth - singleWidth, singleX))
      this.fields.single.style.left = singleX + 'px'

      if (fromX + fromWidth < toX) {
        this.fields.single.style.display = 'none'
        this.fields.from.style.display = 'block'
        this.fields.to.style.display = 'block'
      } else {
        this.fields.single.style.display = 'block'
        this.fields.from.style.display = 'none'
        this.fields.to.style.display = 'none'
      }

      if (!this.settings.hideMinMax && !this.settings.hideFromTo) {
        const minHidden =
          singleX < this.dimensions.fieldMinWidth || fromX < this.dimensions.fieldMinWidth
        const maxHidden =
          singleX + singleWidth > normalWidth - this.dimensions.fieldMaxWidth ||
          toX + toWidth > normalWidth - this.dimensions.fieldMaxWidth

        this.fields.min.style.display = minHidden ? 'none' : 'block'
        this.fields.max.style.display = maxHidden ? 'none' : 'block'
      }

      this.element.value = `${this.numbers.fromNumber};${this.numbers.toNumber}`
    }

    this.callCallback('onChange')
  }

  createGrid() {
    this.container.classList.add('irs-with-grid')

    const normalWidth = this.dimensions.normalWidth
    const smNum = 20
    const bigNum = 4
    const gutter = 8
    let gridHTML = ''

    for (let i = 0; i <= smNum; i++) {
      let step = Math.floor(((normalWidth - 2 * gutter) / smNum) * i) + gutter
      if (step >= normalWidth) step = normalWidth - 1
      gridHTML += `<span class="irs-grid-pol small" style="left: ${step}px;"></span>`
    }

    for (let i = 0; i <= bigNum; i++) {
      let step = Math.floor(((normalWidth - 2 * gutter) / bigNum) * i) + gutter
      if (step >= normalWidth) step = normalWidth - 1
      gridHTML += `<span class="irs-grid-pol" style="left: ${step}px;"></span>`

      let text = ''
      if (this.stepFloat) {
        text = this.settings.min + ((this.settings.max - this.settings.min) / bigNum) * i
        text = (text / this.settings.step) * this.settings.step
        text = parseInt(text * this.stepFloat, 10) / this.stepFloat
      } else {
        text = Math.round(
          this.settings.min + ((this.settings.max - this.settings.min) / bigNum) * i
        )
        text = Math.round(text / this.settings.step) * this.settings.step
        text = this.prettify(text)
      }

      if (this.allowValues) {
        if (this.settings.hideMinMax) {
          text = Math.round(
            this.settings.min + ((this.settings.max - this.settings.min) / bigNum) * i
          )
          text = Math.round(text / this.settings.step) * this.settings.step
          text = i === 0 || i === bigNum ? this.settings.values[text] : ''
        } else {
          text = ''
        }
      }

      let tStep
      let textAlign = ''
      if (i === 0) {
        tStep = step
        textAlign = 'text-align: left;'
      } else if (i === bigNum) {
        tStep = step - 100
        textAlign = 'text-align: right;'
      } else {
        tStep = step - 50
      }

      gridHTML += `<span class="irs-grid-text" style="left: ${tStep}px; ${textAlign}">${text}</span>`
    }

    this.grid.innerHTML = gridHTML
  }

  setDisabled(disabled) {
    this.settings.disable = disabled

    if (disabled) {
      this.container.classList.add('irs-disabled')
      if (!this.container.querySelector('.irs-disable-mask')) {
        this.container.insertAdjacentHTML(
          'beforeend',
          '<span class="irs-disable-mask"></span>'
        )
      }
    } else {
      this.container.classList.remove('irs-disabled')
      const mask = this.container.querySelector('.irs-disable-mask')
      if (mask) {
        mask.remove()
      }
    }
  }

  prettify(num) {
    const str = num.toString()
    return this.settings.prettify
      ? str.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, '$1 ')
      : str
  }

  callCallback(callbackName) {
    const callback = this.settings[callbackName]
    if (typeof callback === 'function') {
      if (callbackName === 'onFinish' && (this.isActive || this.firstStart)) return
      if (callbackName === 'onChange' && this.firstStart) return
      if (callbackName === 'onLoad' && (!this.firstStart || this.isActive)) return

      callback.call(this.element, this.numbers)
    }
  }

  update(options) {
    this.firstStart = true
    Object.assign(this.settings, options)
    this.validateSettings()
    this.remove()
    this.init()
    this.triggerChange()
  }

  triggerChange() {
    this.callCallback('onChange')
  }

  remove() {
    this.container.removeEventListener('pointerdown', this.handleContainerClick)
    document.removeEventListener('pointermove', this.handlePointerMove)
    document.removeEventListener('pointerup', this.handlePointerUp)

    this.container.remove()
    this.element.dataset.isActive = 'false'
    this.element.style.display = ''
  }
}

RangeSlider.create = function (selector, options = {}) {
  const elements =
    typeof selector === 'string' ? document.querySelectorAll(selector) : [selector]
  const instances = []

  elements.forEach(element => {
    if (element && !element.dataset.isActive) {
      instances.push(new RangeSlider(element, options))
    }
  })

  return instances.length === 1 ? instances[0] : instances
}

export default RangeSlider
