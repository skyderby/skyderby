import { ticks } from 'd3-array'

import { Range } from './types'

type Interpolator = (x: number) => number

export class LinearScale {
  domain: Range
  range: Range
  interpolator: Interpolator | null

  constructor() {
    this.domain = [0, 1]
    this.range = [0, 1]
    this.interpolator = null
  }

  createInterpolator(domain: Range, range: Range): Interpolator {
    const d0 = domain[0]
    const d1 = domain[1]

    const r0 = range[0]
    const r1 = range[1]

    if (d1 < d0) {
      return x => this.interpolateValue(r1, r0)(this.deinterpolateValue(d1, d0)(x))
    } else {
      return x => this.interpolateValue(r0, r1)(this.deinterpolateValue(d0, d1)(x))
    }
  }

  interpolateValue(a: number, b: number): Interpolator {
    return (
      (a = +a),
      (b -= a),
      function i(t) {
        return a + b * t
      }
    )
  }

  deinterpolateValue(a: number, b: number): Interpolator {
    // eslint-disable-next-line no-cond-assign
    return (b -= a = +a) ? x => (x - a) / b : () => b
  }

  rescale(): LinearScale {
    this.interpolator = null

    return this
  }

  getValue(x: number): number {
    const { domain, range } = this

    return (
      this.interpolator || (this.interpolator = this.createInterpolator(domain, range))
    )(+x)
  }

  setDomain(val: Range): LinearScale {
    this.domain = [val[0], val[1]]

    this.rescale()

    return this
  }

  getDomain(): Range {
    return this.domain
  }

  setRange(val: Range): LinearScale {
    this.range = [val[0], val[1]]

    return this
  }

  getTicks(count: number): number[] {
    const d = this.domain
    return ticks(d[0], d[1], count ? count : 10)
  }
}
