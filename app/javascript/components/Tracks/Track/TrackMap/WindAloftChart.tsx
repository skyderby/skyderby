import React from 'react'
import {
  AxisLabelsFormatterContextObject,
  PointLabelObject,
  TooltipFormatterContextObject
} from 'highcharts'

import { WindDataRecord } from 'api/hooks/tracks/windData'
import Highchart from 'components/Highchart'

type WindAloftChartProps = {
  windData: WindDataRecord[]
}

const WindAloftChart = ({ windData }: WindAloftChartProps): JSX.Element => {
  const chartData = windData
    .filter(el => el.altitude <= 5000)
    .map(el => ({
      x: Number(el.windDirection),
      y: Math.round(el.altitude / 100) / 10,
      custom: {
        altitude: Math.round(el.altitude),
        windSpeed: Math.round(el.windSpeed * 10) / 10
      }
    }))

  const options = {
    chart: {
      polar: true,
      height: 250
    },
    title: {
      text: 'Winds aloft'
    },
    pane: {
      startAngle: 0,
      endAngle: 360
    },
    tooltip: {
      formatter: function (this: TooltipFormatterContextObject): string {
        return `
          <b>Altitude</b> ${this.point.options.custom?.altitude} m
          <br>
          <b>Speed:</b> ${this.point.options.custom?.windSpeed} m/s
          <br>
          <b>Direction:</b> ${Math.round(this.x)}°
        `
      }
    },
    xAxis: {
      tickInterval: 45,
      min: 0,
      max: 360,
      labels: {
        formatter: function (this: AxisLabelsFormatterContextObject<number>) {
          return `${this.value}°`
        }
      }
    },
    yAxis: {
      min: 0,
      max: 5,
      tickInterval: 1,
      labels: {
        formatter: function (this: AxisLabelsFormatterContextObject<number>) {
          return `${this.value}k`
        }
      }
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          align: 'left' as const,
          verticalAlign: 'middle' as const,
          color: '#606060',
          formatter: function (this: PointLabelObject) {
            return `${this.point.options.custom?.windSpeed} m/s`
          }
        }
      },
      column: {
        pointPadding: 0,
        groupPadding: 0
      }
    },
    legend: {
      enabled: false
    },
    series: [
      {
        type: 'scatter' as const,
        name: 'Wind speed',
        data: chartData,
        pointPlacement: 'between'
      }
    ],
    credits: {
      enabled: false
    }
  }

  return <Highchart options={options} />
}

export default WindAloftChart
