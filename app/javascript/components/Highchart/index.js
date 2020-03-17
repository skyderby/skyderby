import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react'
import PropTypes from 'prop-types'

import { refreshTooltipHandler } from './refreshTooltipHandler'
import Plotband from './Plotband'
import Series from './Series'

const Highchart = forwardRef(({ options, children, autoResize }, ref) => {
  const [Highcharts, setHighcharts] = useState()
  const [chart, setChart] = useState()

  const element = useRef()

  useImperativeHandle(
    ref,
    () => ({
      refreshTooltip: refreshTooltipHandler(chart),
      reflow: () => chart.current.reflow()
    }),
    [chart]
  )

  useEffect(() => {
    if (!autoResize || !chart) return

    const resizeHandler = () => {
      const parentBoundingRect = element.current.parentElement.getBoundingClientRect()
      chart.setSize(parentBoundingRect.width, parentBoundingRect.height, false)
    }

    window.addEventListener('resize', resizeHandler, { passive: true })

    resizeHandler()

    return () => window.removeEventListener('resize', resizeHandler)
  }, [autoResize, chart])

  useEffect(() => {
    Promise.all([
      import(/* webpackChunkName: "Highcharts" */ 'highcharts'),
      import(/* webpackChunkName: "Highcharts" */ 'highcharts/highcharts-more')
    ]).then(([{ default: highchartsModule }, { default: highchartsMoreExtension }]) => {
      highchartsMoreExtension(highchartsModule)
      setHighcharts(highchartsModule)
    })
  }, [])

  useEffect(() => {
    if (!Highcharts) return

    if (chart) {
      chart.update(options, true, true)
    } else {
      setChart(Highcharts.chart(element.current, options))
    }
  }, [options, Highcharts, chart])

  useEffect(() => {
    return () => chart?.destroy()
  }, [chart])

  return (
    <div ref={element}>
      {chart && children instanceof Function ? children(chart) : null}
    </div>
  )
})

Highchart.Plotband = Plotband
Highchart.Series = Series

Highchart.displayName = 'Highchart'

Highchart.propTypes = {
  options: PropTypes.object.isRequired,
  children: PropTypes.func
}

export default Highchart
