import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react'
import type { Chart, Options } from 'highcharts'
import isEqual from 'lodash.isequal'

import { refreshTooltipHandler } from './utils'

type HighchartsModule = typeof import('highcharts')
type HighchartProps = {
  options: Options
  children?: (chart: Chart) => JSX.Element | null
  autoResize?: boolean
  loading?: boolean | string
}

const Highchart = forwardRef(
  ({ options, children, autoResize, loading }: HighchartProps, ref) => {
    const [Highcharts, setHighcharts] = useState<HighchartsModule>()
    const [chart, setChart] = useState<Chart>()
    const prevOptions = useRef<Options>()

    const element = useRef<HTMLDivElement>(null)

    useImperativeHandle(
      ref,
      () => ({
        refreshTooltip: refreshTooltipHandler(chart),
        reflow: () => chart?.reflow()
      }),
      [chart]
    )

    useLayoutEffect(() => {
      if (!autoResize || !chart) return

      const resizeHandler = () => {
        const parent = element.current?.parentElement
        const parentBoundingRect = parent?.getBoundingClientRect()
        if (!parentBoundingRect) return

        chart.setSize(parentBoundingRect.width, parentBoundingRect.height, false)
      }

      window.addEventListener('resize', resizeHandler, { passive: true })

      resizeHandler()

      return () => window.removeEventListener('resize', resizeHandler)
    }, [autoResize, chart])

    useEffect(() => {
      let effectCancelled = false

      Promise.all([
        import(/* webpackChunkName: "Highcharts" */ 'highcharts'),
        import(/* webpackChunkName: "Highcharts" */ 'highcharts/highcharts-more')
      ]).then(([{ default: highchartsModule }, { default: highchartsMoreExtension }]) => {
        if (effectCancelled) return

        highchartsMoreExtension(highchartsModule)
        setHighcharts(highchartsModule)
      })

      return () => {
        effectCancelled = true
      }
    }, [])

    useEffect(() => {
      if (!Highcharts || !element.current) return

      if (chart) {
        if (isEqual(prevOptions.current, options)) return

        chart.update(options, true, true)
        prevOptions.current = options
      } else {
        setChart(Highcharts.chart(element.current, options))
      }
    }, [options, Highcharts, chart])

    useEffect(() => {
      if (!chart) return

      if (loading) {
        const loadingMessage = typeof loading === 'string' ? loading : undefined
        chart.showLoading(loadingMessage)
      } else {
        chart.hideLoading()
      }
    }, [chart, loading])

    useEffect(() => {
      return () => chart && chart.destroy()
    }, [chart])

    return (
      <div ref={element}>
        {chart && children instanceof Function ? children(chart) : null}
      </div>
    )
  }
)

Highchart.displayName = 'Highchart'

export default Highchart
