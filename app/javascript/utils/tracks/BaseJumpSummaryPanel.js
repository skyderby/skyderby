import I18n from 'i18n'
import { cloneTemplate, fillSlots, slot } from 'utils/templates'
import { convertLength, convertSpeed, speedUnitLabel, lengthUnitLabel } from 'utils/units'

const EMPTY = '—'

const seconds = value => (value >= 10 ? Math.round(value) : Number(value.toFixed(1)))

export default class BaseJumpSummaryPanel {
  constructor({ container, rowTemplate }) {
    this.container = container
    this.rowTemplate = rowTemplate
  }

  render({ summary, compare = null, units = 'metric' }) {
    this.units = units
    this.comparing = Boolean(compare)

    const length = value =>
      value == null ? null : Math.round(convertLength(value, units))
    const speed = value => (value == null ? null : Math.round(convertSpeed(value, units)))
    const glide = value => (value == null ? null : value.toFixed(2))
    const lengthUnit = lengthUnitLabel(units)
    const secondsUnit = I18n.t('units.sec')
    const drop = `${length(summary.referenceDrop)} ${lengthUnit}`

    this.tile('one_to_one', {
      value: length(summary.oneToOneDrop),
      compare: compare && length(compare.oneToOneDrop),
      unit: lengthUnit
    })

    this.tile('first_drop', {
      labelArgs: { drop },
      value: length(summary.referenceDistance),
      compare: compare && length(compare.referenceDistance),
      unit: lengthUnit,
      rows: this.rows(
        summary.referenceBands,
        compare?.referenceBands,
        band => `${length(band.from)}–${length(band.to)}`,
        band => band.distance
      ),
      formatValue: length,
      rowUnit: lengthUnit
    })

    this.tile('glide', {
      value: glide(summary.glide.value),
      compare: compare && glide(compare.glide.value),
      rows: this.rows(
        summary.glide.buckets,
        compare?.glide.buckets,
        bucket => this.bucketLabel(bucket, edge => String(Number(edge.toFixed(1)))),
        bucket => bucket.seconds
      ),
      formatValue: seconds,
      rowUnit: secondsUnit
    })

    this.tile('speed', {
      value: speed(summary.speed.value),
      compare: compare && speed(compare.speed.value),
      unit: speedUnitLabel(units),
      rows: this.rows(
        summary.speed.buckets,
        compare?.speed.buckets,
        bucket => this.bucketLabel(bucket, edge => String(speed(edge))),
        bucket => bucket.seconds
      ),
      formatValue: seconds,
      rowUnit: secondsUnit
    })

    this.container.hidden = false
  }

  tile(key, { labelArgs, value, compare, unit = '', rows = null, formatValue, rowUnit }) {
    const tile = this.container.querySelector(`[data-summary-tile="${key}"]`)
    if (!tile) return

    if (labelArgs) {
      fillSlots(tile, {
        label: I18n.t(`tracks.base_pro.summary.${key}`, labelArgs),
        help: I18n.t(`tracks.base_pro.tooltip.${key}`, labelArgs)
      })
      slot(tile, 'help')?.parentElement?.setAttribute(
        'aria-label',
        slot(tile, 'help').textContent
      )
    }

    fillSlots(tile, {
      value: value ?? EMPTY,
      unit: value == null ? '' : unit,
      compareValue: compare ?? EMPTY
    })

    const compareNode = slot(tile, 'compare')
    if (compareNode) compareNode.hidden = !this.comparing

    const histogram = slot(tile, 'histogram')
    if (!histogram) return

    histogram.hidden = !rows
    histogram.replaceChildren()
    if (!rows) return

    const peak = Math.max(...rows.flatMap(row => [row.value ?? 0, row.compare ?? 0]), 1)
    rows.forEach(row => histogram.append(this.rowNode(row, peak, formatValue, rowUnit)))
  }

  rowNode(row, peak, formatValue, unit) {
    const node = cloneTemplate(this.rowTemplate)
    const format = value => (value == null ? EMPTY : formatValue(value))

    fillSlots(node, {
      band: row.label,
      value: format(row.value),
      compareValue: this.comparing ? format(row.compare) : '',
      unit
    })

    slot(node, 'bar').style.width = `${((row.value ?? 0) / peak) * 100}%`

    const compareBar = slot(node, 'compareBar')
    compareBar.hidden = !this.comparing
    compareBar.style.width = `${((row.compare ?? 0) / peak) * 100}%`

    slot(node, 'sep').hidden = !this.comparing

    return node
  }

  rows(bands, compareBands, formatBand, valueOf) {
    return bands.map((band, index) => ({
      label: formatBand(band),
      value: valueOf(band),
      compare: compareBands ? valueOf(compareBands[index]) : null
    }))
  }

  bucketLabel(bucket, formatEdge) {
    if (bucket.min === null) return `<${formatEdge(bucket.max)}`
    if (bucket.max === null) return `${formatEdge(bucket.min)}+`
    return `${formatEdge(bucket.min)}–${formatEdge(bucket.max)}`
  }
}
