const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export default class TimeViewport {
  constructor({ min, max, minSpan = 1, onChange }) {
    this.min = min
    this.max = max
    this.minSpan = Math.min(minSpan, max - min)
    this.onChange = onChange
    this.range = null
  }

  get from() {
    return this.range?.from ?? this.min
  }

  get to() {
    return this.range?.to ?? this.max
  }

  get span() {
    return this.to - this.from
  }

  zoom(factor, anchor, source = null) {
    if (!(factor > 0) || !Number.isFinite(anchor)) return

    const span = clamp(this.span / factor, this.minSpan, this.max - this.min)
    const from = anchor - (anchor - this.from) * (span / this.span)
    this.set({ from, to: from + span }, source)
  }

  pan(delta, source = null) {
    if (!this.range || !Number.isFinite(delta)) return

    this.set({ from: this.from + delta, to: this.to + delta }, source)
  }

  set(range, source = null) {
    this.range = this.normalize(range)
    this.onChange(this.range, source)
  }

  reset(source = null) {
    this.set(null, source)
  }

  normalize(range) {
    if (!range) return null

    const full = this.max - this.min
    const span = clamp(range.to - range.from, this.minSpan, full)
    if (span >= full * 0.999) return null

    const from = clamp(range.from, this.min, this.max - span)
    return { from, to: from + span }
  }
}
