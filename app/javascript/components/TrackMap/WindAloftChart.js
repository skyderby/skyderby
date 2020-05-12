import React from 'react'
import PropTypes from 'prop-types'

import Highchart from 'components/Highchart'

const WindAloftChart = ({ windData }) => {
  const chartData = windData
    .filter(el => el.altitude <= 5000)
    .map(el => ({
      x: Number(el.windDirection),
      y: Math.round(el.altitude / 100) / 10,
      altitude: Math.round(el.altitude),
      windSpeed: Math.round(el.windSpeed * 10) / 10
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
      formatter: function () {
        return `
          <b>Altitude</b> ${this.point.options.altitude} m
          <br>
          <b>Speed:</b> ${this.point.options.windSpeed} m/s
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
        formatter: function () {
          return `${this.value}°`
        }
      }
    },
    yAxis: {
      min: 0,
      max: 5,
      tickInterval: 1,
      labels: {
        formatter: function () {
          return `${this.value}k`
        }
      }
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          align: 'left',
          verticalAlign: 'middle',
          color: '#606060',
          formatter: function () {
            return `${this.point.windSpeed} m/s`
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
        type: 'scatter',
        name: 'Wind speed',
        data: chartData,
        pointPlacement: 'between'
      }
    ],
    credits: false
  }

  return <Highchart options={options} />
}

WindAloftChart.propTypes = {
  windData: PropTypes.arrayOf(
    PropTypes.shape({
      altitude: PropTypes.number.isRequired,
      windDirection: PropTypes.number.isRequired,
      windSpeed: PropTypes.number.isRequired
    })
  )
}

export default WindAloftChart
