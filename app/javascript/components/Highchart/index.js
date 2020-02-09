import React, { useEffect, useRef, forwardRef } from 'react'
import Highcharts from 'highcharts'
import PropTypes from 'prop-types'

import { useImperativeTooltipHandler } from './useImperativeTooltipHandler'

const Highchart = forwardRef(({ options }, ref) => {
  const element = useRef()
  const chart = useRef()

  useImperativeTooltipHandler(ref, chart)

  useEffect(() => {
    if (chart.current) {
      chart.current.update(options)
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
