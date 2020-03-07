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

const Highchart = forwardRef(({ options, children }, ref) => {
  const [Highcharts, setHighcharts] = useState()

  const element = useRef()
  const chart = useRef()

  useImperativeHandle(
    ref,
    () => ({
      refreshTooltip: refreshTooltipHandler(chart),
      reflow: () => chart.current.reflow()
    }),
    [chart]
  )

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

    if (chart.current) {
      chart.current.update(options, true, true)
    } else {
      chart.current = Highcharts.chart(element.current, options)
    }
  }, [options, Highcharts])

  useEffect(() => {
    return () => chart.current?.destroy()
  }, [])

  return (
    <div ref={element}>
      {chart.current && children instanceof Function ? children(chart.current) : null}
    </div>
  )
})

Highchart.Plotband = Plotband

Highchart.displayName = 'Highchart'

Highchart.propTypes = {
  options: PropTypes.object.isRequired,
  children: PropTypes.func
}

export default Highchart
