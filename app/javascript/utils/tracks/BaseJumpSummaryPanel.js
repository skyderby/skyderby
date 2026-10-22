import { cloneTemplate, fillSlots, slot } from 'utils/templates'
import { convertLength, convertSpeed, speedUnitLabel, lengthUnitLabel } from 'utils/units'

const EMPTY = '—'

const seconds = value => (value >= 10 ? Math.round(value) : Number(value.toFixed(1)))

const clock = value => {
  if (value == null) return null
  const total = Math.round(value)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export default class BaseJumpSummaryPanel {
  constructor({ container, rowTemplate, labels }) {
    this.container = container
    this.labels = labels
    this.rowTemplate = rowTemplate
  }

  render({ summary, compare = null, units = 'metric' }) {
    this.units = units
    this.comparing = Boolean(compare)

    const length = value =>
      value == null ? null : Math.round(convertLength(value, units))
    const speed = value => (value == null ? null : Math.round(convertSpeed(value, units)))
    const glide = value => (value == null ? null : value.toFixed(2))
    const lengthUnit = lengthUnitLabel(units, this.labels)
    const secondsUnit = this.labels.t('units.sec')
    const drop = `${length(summary.referenceDrop)} ${lengthUnit}`

    this.tile('one_to_one', {
      value: length(summary.oneToOneDrop),
      compare: compare && length(compare.oneToOneDrop),
      unit: lengthUnit
    })

    this.tile('glide_one', {
      value: length(summary.glideOneDrop),
      compare: compare && length(compare.glideOneDrop),
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
      rowUnit: lengthUnit,
      cascade: true
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
      unit: speedUnitLabel(units, this.labels),
      rows: this.rows(
        summary.speed.buckets,
        compare?.speed.buckets,
        bucket => this.bucketLabel(bucket, edge => String(speed(edge))),
        bucket => bucket.seconds
      ),
      formatValue: seconds,
      rowUnit: secondsUnit
    })

    this.tile('max_speed', {
      value: speed(summary.maxFullSpeed),
      compare: compare && speed(compare.maxFullSpeed),
      unit: speedUnitLabel(units, this.labels)
    })

    this.tile('max_flare', {
      value: length(summary.maxFlare),
      compare: compare && length(compare.maxFlare),
      unit: lengthUnit
    })

    this.tile('canopy', {
      value: clock(summary.canopyTime),
      compare: compare && clock(compare.canopyTime),
      hideEmpty: true
    })

    this.container.hidden = false
  }

  tile(
    key,
    {
      labelArgs,
      value,
      compare,
      unit = '',
      rows = null,
      formatValue,
      rowUnit,
      hideEmpty,
      cascade = false
    }
  ) {
    this.cell(key, { labelArgs, value, compare, unit })

    const tile = this.container.querySelector(`[data-summary-tile="${key}"]`)
    if (!tile) return

    tile.hidden = Boolean(hideEmpty) && value == null && compare == null

    if (labelArgs) {
      fillSlots(tile, {
        label: this.labels.t(`tracks.base_pro.summary.${key}`, labelArgs),
        help: this.labels.t(`tracks.base_pro.tooltip.${key}`, labelArgs)
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

    const placed = cascade ? this.cascaded(rows) : rows
    const peak = cascade
      ? Math.max(...placed.flatMap(row => [row.end, row.compareEnd]), 1)
      : Math.max(...rows.flatMap(row => [row.value ?? 0, row.compare ?? 0]), 1)
    placed.forEach(row => histogram.append(this.rowNode(row, peak, formatValue, rowUnit)))
  }

  cascaded(rows) {
    let end = 0
    let compareEnd = 0

    return rows.map(row => {
      const start = end
      const compareStart = compareEnd
      end += row.value ?? 0
      compareEnd += row.compare ?? 0
      return { ...row, start, compareStart, end, compareEnd }
    })
  }

  cell(key, { labelArgs, value, compare, unit }) {
    const cell = this.container.querySelector(`[data-summary-cell="${key}"]`)
    if (!cell) return

    fillSlots(cell, {
      label: this.labels.t(`tracks.base_pro.short.${key}`, labelArgs),
      value: value ?? EMPTY,
      unit: value == null ? '' : unit,
      compareValue: compare == null ? EMPTY : `${compare} ${unit}`.trim()
    })
    slot(cell, 'compare').hidden = !this.comparing
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

    const bar = slot(node, 'bar')
    bar.style.marginLeft = `${((row.start ?? 0) / peak) * 100}%`
    bar.style.width = `${((row.value ?? 0) / peak) * 100}%`

    const compareBar = slot(node, 'compareBar')
    compareBar.hidden = !this.comparing
    compareBar.style.marginLeft = `${((row.compareStart ?? 0) / peak) * 100}%`
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
