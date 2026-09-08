import { svgEl } from './elements'

const NICE_STEPS = [50, 100, 250, 500, 1000, 2000, 2500, 5000, 10000]

export const distanceLineStep = range => {
  if (range > 3000) return 500
  if (range > 1500) return 250
  if (range > 500) return 100
  return 50
}

export const distanceLabelStep = (range, plotWidth, lineStep, minLabelSpacing = 110) => {
  const minStep = (range / plotWidth) * minLabelSpacing
  return (
    NICE_STEPS.find(step => step >= minStep && step % lineStep === 0) || NICE_STEPS.at(-1)
  )
}

export const renderDistanceGrid = (
  grid,
  {
    range,
    plot,
    lineStep,
    labelStep = lineStep,
    labelOffset = 20,
    fromZero = false,
    format = String
  }
) => {
  const span = range.max - range.min
  const first = Math.ceil(range.min / lineStep) * lineStep
  const last = Math.floor(range.max / lineStep) * lineStep

  for (let dist = fromZero ? Math.max(0, first) : first; dist <= last; dist += lineStep) {
    const x = plot.left + ((dist - range.min) / span) * plot.width

    grid.appendChild(
      svgEl('line', {
        x1: x,
        y1: plot.top,
        x2: x,
        y2: plot.top + plot.height,
        class: 'grid-line-vertical'
      })
    )

    if (dist % labelStep !== 0) continue

    grid.appendChild(
      svgEl(
        'text',
        { x, y: plot.top + plot.height + labelOffset, class: 'grid-label-distance' },
        format(dist)
      )
    )
  }
}

export const renderWindowLines = (grid, { plot, startY, endY, labels = null }) => {
  const x2 = plot.left + plot.width
  grid.appendChild(
    svgEl('line', {
      x1: plot.left,
      y1: startY,
      x2,
      y2: startY,
      class: 'grid-line-window-start'
    })
  )
  grid.appendChild(
    svgEl('line', {
      x1: plot.left,
      y1: endY,
      x2,
      y2: endY,
      class: 'grid-line-window-end'
    })
  )

  if (!labels) return

  const attrs = y => ({
    x: plot.left - 10,
    y: y + 4,
    class: 'grid-label grid-label-window'
  })
  grid.appendChild(svgEl('text', attrs(startY), labels.start))
  grid.appendChild(svgEl('text', attrs(endY), labels.end))
}
