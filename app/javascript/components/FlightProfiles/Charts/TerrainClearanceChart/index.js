import React from 'react'

import Highchart from 'components/Highchart'

const TerrainClearanceChart = () => {
  const setExtremes = console.log

  const options = {
    chart: {
      type: 'spline',
      height: '150px'
    },
    title: {
      text: null
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: false
        }
      },
      series: {
        marker: {
          radius: 1
        }
      }
    },
    tooltip: {
      crosshairs: true
    },
    yAxis: {
      title: {
        text: 'Terrain clearance'
      },
      gridLineWidth: 1,
      tickInterval: 25,
      min: 0,
      max: 125,
      plotBands: [
        {
          color: '#FF928B',
          from: 0,
          to: 25
        },
        {
          color: '#B5EA9D',
          from: 100,
          to: 125
        }
      ],
      events: {
        setExtremes
      }
    },
    xAxis: {
      title: {
        text: null
      },
      tickInterval: 100,
      tickLength: 0,
      gridLineWidth: 1,
      min: 0,
      max: 760,
      labels: {
        enabled: false
      }
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    }
  }

  return (
    <Highchart autoResize options={options}>
      {chart => (
        <Highchart.Series
          chart={chart}
          data={[
            [0, 0],
            [75, 10],
            [150, 20],
            [250, 30],
            [400, 40],
            [700, 120]
          ]}
        />
      )}
    </Highchart>
  )
}

export default TerrainClearanceChart
