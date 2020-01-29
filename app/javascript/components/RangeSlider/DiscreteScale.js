function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export class DiscreteScale {
  setDomain(val) {
    this.domain = [val[0], val[1]]

    return this
  }

  setRange(val) {
    this.range = [val[0], val[1]]

    return this
  }

  setStep(val) {
    this.step = val

    return this
  }

  getValue(x) {
    const {
      domain: [d0, d1],
      range: [r0, r1],
      step
    } = this

    if (x === d0) return r0
    if (x === d1) return r1

    const p = (clamp(x, d0, d1) - d0) / (d1 - d0)
    const b = step * Math.round((r0 + p * (r1 - r0)) / step)

    return clamp(b, Math.min(r0, r1), Math.max(r0, r1))
  }
}
