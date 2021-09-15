import { Range } from './types'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export class DiscreteScale {
  domain: Range
  range: Range
  step: number

  constructor() {
    this.domain = [0, 1]
    this.range = [0, 1]
    this.step = 1
  }

  setDomain(val: Range): DiscreteScale {
    this.domain = [val[0], val[1]]

    return this
  }

  setRange(val: Range): DiscreteScale {
    this.range = [val[0], val[1]]

    return this
  }

  setStep(val: number): DiscreteScale {
    this.step = val

    return this
  }

  getValue(x: number): number {
    const {
      domain: [d0, d1],
      range: [r0, r1],
      step
    } = this

    if (x <= d0) return r0
    if (x >= d1) return r1

    const p = (clamp(x, d0, d1) - d0) / (d1 - d0)
    const b = step * Math.round((r0 + p * (r1 - r0)) / step)

    return clamp(b, Math.min(r0, r1), Math.max(r0, r1))
  }
}
