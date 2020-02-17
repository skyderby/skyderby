import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import Highcharts from 'highcharts'
import PropTypes from 'prop-types'

import { refreshTooltipHandler } from './refreshTooltipHandler'

const Highchart = forwardRef(({ options }, ref) => {
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
    if (chart.current) {
      chart.current.update(options, true, true)
    } else {
      chart.current = Highcharts.chart(element.current, options)
    }
  }, [options])

  useEffect(() => {
    return () => chart.current?.destroy()
  }, [])

  return <div ref={element} />
})

Highchart.displayName = 'Highchart'

Highchart.propTypes = {
  options: PropTypes.object.isRequired
}

export default Highchart
