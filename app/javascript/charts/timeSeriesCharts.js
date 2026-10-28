import TimeSeriesChart from './TimeSeriesChart'
import { calculateCumulativeDistance } from './altitudeDistance'
import { convertSpeed, convertLength, speedUnitLabel, lengthUnitLabel } from 'utils/units'
import { accelerationHtml } from './svg/format'
import { accelerationAt } from 'utils/tracks/playback/indicators'

const GLIDE_COLOR = '#37889B'
const GLIDE_WIND_COLOR = 'rgba(63, 136, 167, 0.3)'
const WARNING_COLOR = '#e3353f'
const GROUND_SPEED_COLOR = '#52A964'
const SPEED_WIND_COLOR = 'rgba(178, 201, 171, 0.5)'
const VERTICAL_SPEED_COLOR = '#A7414E'
const FULL_SPEED_COLOR = '#D6A184'
const SEP_COLOR = '#A6AFBB'
const SEP_LIMIT_COLOR = '#9e0419'
const HEIGHT_COLOR = '#7cb5ec'
const COMBINED_HEIGHT_COLOR = '#aaa'
const ELEVATION_COLOR = '#434348'
const DISTANCE_COLOR = '#90ed7d'
const AXIS_LABEL_COLOR = '#666'

const GLIDE_ZONES = [
  { upTo: 0.1, color: WARNING_COLOR },
  { upTo: 6.8, color: GLIDE_COLOR },
  { color: WARNING_COLOR }
]
const SEP_ZONES = [{ upTo: 10, color: SEP_COLOR }, { color: WARNING_COLOR }]

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const finite = value => (Number.isFinite(value) ? value : null)

const signed = text => (text.startsWith('-') ? text : `+${text}`)

const timeline = (points, shift) =>
  points.map(point => point.flTime - points[0].flTime + shift)

const shiftLines = (lines, xOffset) =>
  xOffset ? lines.map(line => ({ ...line, value: line.value - xOffset })) : lines

const shiftBands = (bands, xOffset) =>
  xOffset
    ? bands.map(band => ({ ...band, from: band.from - xOffset, to: band.to - xOffset }))
    : bands

const compareName = (labels, name, suffixKey) => {
  const base = name || labels.t('charts.compare.default_name')
  return suffixKey ? `${base} ${labels.t(`charts.compare.${suffixKey}`)}` : base
}

const glideValues = points => points.map(point => finite(clamp(point.glideRatio, 0, 7)))
const glideValue = points => i => String(Math.round(points[i].glideRatio * 100) / 100)

const speedValues = (points, key, { units }) =>
  points.map(point => finite(Math.round(convertSpeed(point[key], units))))
const speedValue =
  (points, key, { units, labels }) =>
  i =>
    `${Math.round(convertSpeed(points[i][key], units))} ${speedUnitLabel(units, labels)}`

const speedAcceleration = (points, key) => i =>
  accelerationHtml(accelerationAt(points, i)?.[key])

const lengthValue =
  (points, key, { units, labels }) =>
  i =>
    `${Math.round(convertLength(points[i][key], units))} ${lengthUnitLabel(units, labels)}`

const context = (
  points,
  {
    xOffset = 0,
    units = 'metric',
    labels,
    plotLines = [],
    plotBands = [],
    onHover = null,
    onLeave = null,
    comparePoints = null,
    compareTimeOffset = 0,
    xRange = null,
    onZoom = null,
    onPan = null
  }
) => {
  const xs = timeline(points, -xOffset)
  const header = index => {
    const seconds = Math.round(xs[index])
    const altitude = Math.round(convertLength(points[index].altitude, units))
    return `${seconds}${labels.t('units.sec')} | ${labels.t('charts.all_data.series.height')}: ${altitude} ${lengthUnitLabel(units, labels)}`
  }

  return {
    xs,
    ctx: { units, labels },
    compareXs: comparePoints?.length
      ? timeline(comparePoints, compareTimeOffset - xOffset)
      : null,
    chartOptions: {
      plotLines: shiftLines(plotLines, xOffset),
      plotBands: shiftBands(plotBands, xOffset),
      tooltipHeader: header,
      onHover,
      onLeave,
      xRange,
      onZoom,
      onPan
    }
  }
}

const glideSeries = (points, xs, { labels }, options = {}) => ({
  code: 'gr',
  name: labels.t('charts.all_data.series.gr'),
  color: GLIDE_COLOR,
  zones: GLIDE_ZONES,
  xs,
  ys: glideValues(points),
  value: glideValue(points),
  ...options
})

const glideWindSeries = (points, xs, { labels }, options = {}) => ({
  code: 'gr_wind_effect',
  name: labels.t('charts.gr.series.wind_effect'),
  type: 'range',
  color: GLIDE_WIND_COLOR,
  lineColor: GLIDE_COLOR,
  xs,
  ysLow: glideValues(points),
  ysHigh: points.map(point => finite(clamp(point.zerowindGlideRatio, 0, 7))),
  value: i => signed((points[i].zerowindGlideRatio - points[i].glideRatio).toFixed(2)),
  ...options
})

const speedSeries = (points, xs, ctx) => [
  {
    code: 'ground_speed',
    name: ctx.labels.t('charts.all_data.series.horiz_speed'),
    color: GROUND_SPEED_COLOR,
    xs,
    ys: speedValues(points, 'hSpeed', ctx),
    value: speedValue(points, 'hSpeed', ctx),
    acceleration: speedAcceleration(points, 'hSpeedAccel')
  },
  {
    code: 'vertical_speed',
    name: ctx.labels.t('charts.all_data.series.vert_speed'),
    color: VERTICAL_SPEED_COLOR,
    xs,
    ys: speedValues(points, 'vSpeed', ctx),
    value: speedValue(points, 'vSpeed', ctx),
    acceleration: speedAcceleration(points, 'vSpeedAccel')
  },
  {
    code: 'full_speed',
    name: ctx.labels.t('charts.all_data.series.full_speed'),
    color: FULL_SPEED_COLOR,
    visible: false,
    xs,
    ys: speedValues(points, 'fullSpeed', ctx),
    value: speedValue(points, 'fullSpeed', ctx),
    acceleration: speedAcceleration(points, 'fullSpeedAccel')
  }
]

const speedWindSeries = (points, xs, ctx) => ({
  code: 'speed_wind_effect',
  name: ctx.labels.t('charts.spd.series.wind_effect'),
  type: 'range',
  color: SPEED_WIND_COLOR,
  lineColor: GROUND_SPEED_COLOR,
  xs,
  ysLow: speedValues(points, 'hSpeed', ctx),
  ysHigh: speedValues(points, 'zerowindHSpeed', ctx),
  value: i =>
    `${signed(String(Math.round(convertSpeed(points[i].zerowindHSpeed - points[i].hSpeed, ctx.units))))} ${speedUnitLabel(ctx.units, ctx.labels)}`
})

const compareSpeedSeries = (points, xs, ctx, name) =>
  speedSeries(points, xs, ctx).map((series, i) => ({
    ...series,
    code: `compare_${series.code}`,
    name: compareName(
      ctx.labels,
      name,
      ['ground_suffix', 'vertical_suffix', 'full_suffix'][i]
    ),
    dashed: true
  }))

const sepSeries = (points, xs, { labels }, options = {}) => ({
  code: 'sep50',
  name: labels.t('charts.sep.series.sep50'),
  type: 'area',
  color: SEP_COLOR,
  zones: SEP_ZONES,
  xs,
  ys: points.map(point => finite(Math.round(clamp(point.sep50, 0, 15) * 10) / 10)),
  value: i => String(Math.round(points[i].sep50 * 10) / 10),
  ...options
})

const heightSeries = (points, xs, ctx, options = {}) => ({
  code: 'height',
  name: ctx.labels.t('charts.all_data.series.height'),
  type: 'area',
  color: HEIGHT_COLOR,
  xs,
  ys: points.map(point => finite(Math.round(convertLength(point.altitude, ctx.units)))),
  value: lengthValue(points, 'altitude', ctx),
  ...options
})

const distanceSeries = (pointsWithDistance, xs, ctx, options = {}) => [
  {
    code: 'elevation',
    name: ctx.labels.t('charts.elev.series.elevation'),
    color: ELEVATION_COLOR,
    xs,
    ys: pointsWithDistance.map(point =>
      finite(Math.round(convertLength(point.elevation, ctx.units)))
    ),
    value: lengthValue(pointsWithDistance, 'elevation', ctx),
    ...options
  },
  {
    code: 'distance',
    name: ctx.labels.t('charts.elev.series.distance'),
    color: DISTANCE_COLOR,
    xs,
    ys: pointsWithDistance.map(point =>
      finite(Math.round(convertLength(point.cumulativeDistance, ctx.units)))
    ),
    value: lengthValue(pointsWithDistance, 'cumulativeDistance', ctx),
    ...options
  }
]

const glideAxis = {
  min: 0,
  max: 7.5,
  tickMax: 7,
  tickInterval: 1,
  format: (value, isLast) => (isLast ? '≥ 7' : String(value))
}

export const buildGlideChart = (container, points, options = {}) => {
  const { xs, ctx, compareXs, chartOptions } = context(points, options)
  const series = [glideSeries(points, xs, ctx)]

  if (options.windCancellation) series.push(glideWindSeries(points, xs, ctx))
  if (compareXs) {
    series.push(
      glideSeries(options.comparePoints, compareXs, ctx, {
        code: 'gr_compare',
        name: compareName(ctx.labels, options.compareTrackName),
        zones: null,
        dashed: true
      })
    )
  }

  return new TimeSeriesChart(container, {
    ...chartOptions,
    title: options.title ? ctx.labels.t('charts.gr.title') : null,
    legend: options.legend ? { storageKey: 'GlideChart' } : null,
    series,
    yAxis: glideAxis
  })
}

export const buildSpeedChart = (container, points, options = {}) => {
  const { xs, ctx, compareXs, chartOptions } = context(points, options)
  const series = speedSeries(points, xs, ctx)

  if (options.windCancellation) series.push(speedWindSeries(points, xs, ctx))
  if (compareXs) {
    series.push(
      ...compareSpeedSeries(
        options.comparePoints,
        compareXs,
        ctx,
        options.compareTrackName
      )
    )
  }

  return new TimeSeriesChart(container, {
    ...chartOptions,
    title: options.title ? ctx.labels.t('charts.spd.title') : null,
    legend: { storageKey: 'SpeedsChart' },
    series,
    yAxis: { min: 0 }
  })
}

export const buildSepChart = (container, points, options = {}) => {
  const { xs, ctx, chartOptions } = context(points, options)

  return new TimeSeriesChart(container, {
    ...chartOptions,
    tooltipHeader: null,
    series: [sepSeries(points, xs, ctx)],
    yAxis: {
      min: 0,
      max: 15,
      labels: false,
      grid: false,
      plotLines: [{ value: 10, color: SEP_LIMIT_COLOR, dash: 'dash' }]
    },
    xAxis: { labels: false }
  })
}

export const buildAltitudeDistanceChart = (container, points, options = {}) => {
  const { xs, ctx, chartOptions } = context(points, options)
  const pointsWithDistance = calculateCumulativeDistance(points, {
    straightLine: options.straightLine,
    rangeStartPosition: options.rangeStartPosition
  })

  return new TimeSeriesChart(container, {
    ...chartOptions,
    title: ctx.labels.t('charts.elev.title'),
    legend: { storageKey: 'AltitudeDistance' },
    series: [
      heightSeries(points, xs, ctx),
      ...distanceSeries(pointsWithDistance, xs, ctx, { axis: 'distance' })
    ],
    yAxes: [
      { id: 'altitude', min: 0 },
      { id: 'distance', min: 0, labels: false, grid: false }
    ]
  })
}

export const buildCombinedChart = (container, points, options = {}) => {
  const { xs, ctx, chartOptions } = context(points, options)
  const pointsWithDistance = calculateCumulativeDistance(points, {
    straightLine: options.straightLine,
    rangeStartPosition: options.rangeStartPosition
  })

  const series = [
    heightSeries(points, xs, ctx, {
      type: 'line',
      color: COMBINED_HEIGHT_COLOR,
      axis: 'altitude'
    }),
    ...distanceSeries(pointsWithDistance, xs, ctx, {
      axis: 'altitude',
      visible: false
    }),
    ...speedSeries(points, xs, ctx).map(item => ({ ...item, axis: 'speed' })),
    options.windCancellation && { ...speedWindSeries(points, xs, ctx), axis: 'speed' },
    glideSeries(points, xs, ctx, { axis: 'glide' }),
    options.windCancellation && glideWindSeries(points, xs, ctx, { axis: 'glide' }),
    sepSeries(points, xs, ctx, { axis: 'sep' })
  ].filter(Boolean)

  return new TimeSeriesChart(container, {
    ...chartOptions,
    legend: { storageKey: options.chartName || 'CombinedChart' },
    series,
    yAxes: [
      { id: 'altitude', tickInterval: 200 },
      { id: 'speed', min: 0, position: 'right', grid: false, color: AXIS_LABEL_COLOR },
      { id: 'glide', ...glideAxis, position: 'right', grid: false, color: GLIDE_COLOR },
      { id: 'sep', min: 0, max: 75, labels: false, grid: false }
    ]
  })
}

const ACCURACY_COLOR = '#ccc'
const ACCURACY_LIMIT = 3
const VALIDATION_WINDOW_HEIGHT = 1000
const POSITION_COLOR = '#7b4fb0'
const POSITION_GAP_SECONDS = 1
const MAIN_PANE = [0, 0.76]
const FULL_HEIGHT = [0, 1]
const POSITION_PANE = [0.8, 1]

const speedAccuracy = point => (Math.sqrt(2) * point.verticalAccuracy) / 3

const accuracySeries = (points, windowEndAltitude, { labels }) => {
  const validationStart = windowEndAltitude + VALIDATION_WINDOW_HEIGHT
  const inWindow = points.filter(
    point => point.altitude <= validationStart && point.altitude >= windowEndAltitude
  )

  return {
    code: 'speed_accuracy',
    name: labels.t('charts.speed_skydiving.accuracy'),
    type: 'column',
    color: ACCURACY_COLOR,
    zones: [{ upTo: ACCURACY_LIMIT, color: ACCURACY_COLOR }, { color: WARNING_COLOR }],
    axis: 'accuracy',
    xs: inWindow.map(point => point.flTime - points[0].flTime),
    ys: inWindow.map(point => finite(speedAccuracy(point))),
    value: i => String(Math.round(speedAccuracy(inWindow[i]) * 10) / 10)
  }
}

const positionSeries = (points, positions, { labels }) => {
  const startTime = points[0].gpsTime.getTime()
  const xs = []
  const ys = []
  const pitches = []

  positions.forEach(position => {
    const x = (new Date(position.gpsTime).getTime() - startTime) / 1000
    if (xs.length && x - xs[xs.length - 1] > POSITION_GAP_SECONDS) {
      xs.push(x)
      ys.push(null)
      pitches.push(null)
    }
    xs.push(x)
    ys.push(position.pitch)
    pitches.push(position.pitch)
  })

  return {
    code: 'head_position',
    name: labels.t('tracks.speed_pro.metrics.position'),
    color: POSITION_COLOR,
    thin: true,
    axis: 'position',
    xs,
    ys,
    value: i => `${pitches[i] > 0 ? '+' : ''}${Math.round(pitches[i])}°`
  }
}

export const buildSpeedSkydivingChart = (container, points, options = {}) => {
  const { xs, ctx, chartOptions } = context(points, options)
  const hasPositions = options.positions?.length > 0
  const pane = hasPositions ? MAIN_PANE : FULL_HEIGHT

  const series = [
    heightSeries(points, xs, ctx, {
      type: 'line',
      color: COMBINED_HEIGHT_COLOR,
      axis: 'altitude'
    }),
    ...speedSeries(points, xs, ctx).map(item => ({ ...item, axis: 'speed' })),
    options.windCancellation && { ...speedWindSeries(points, xs, ctx), axis: 'speed' },
    glideSeries(points, xs, ctx, { axis: 'glide' }),
    options.windCancellation && glideWindSeries(points, xs, ctx, { axis: 'glide' }),
    accuracySeries(points, options.windowEndAltitude, ctx),
    hasPositions && positionSeries(points, options.positions, ctx)
  ].filter(Boolean)

  return new TimeSeriesChart(container, {
    ...chartOptions,
    legend: { storageKey: 'SpeedSkydivingCombinedChart' },
    series,
    yAxes: [
      { id: 'altitude', tickInterval: 200, pane },
      {
        id: 'speed',
        min: 0,
        position: 'right',
        grid: false,
        color: AXIS_LABEL_COLOR,
        pane
      },
      {
        id: 'glide',
        ...glideAxis,
        position: 'right',
        grid: false,
        color: GLIDE_COLOR,
        pane
      },
      { id: 'accuracy', min: 0, max: 50, labels: false, grid: false, pane },
      {
        id: 'position',
        min: -90,
        max: 90,
        tickInterval: 90,
        labels: hasPositions,
        grid: hasPositions,
        format: value => `${value}°`,
        pane: POSITION_PANE
      }
    ]
  })
}
