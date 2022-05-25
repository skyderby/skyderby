import React from 'react'
import Highchart from 'components/Highchart'
import { PlaceStats } from 'api/places'
import { useI18n } from 'components/TranslationsProvider'
import Highcharts from 'highcharts'

type PopularTimesProps = {
  popularTimes: PlaceStats['popularTimes']
}

const PopularTimes = ({ popularTimes }: PopularTimesProps) => {
  const { formatDate } = useI18n()
  const categories = new Array(12).fill(undefined).map((_val, idx) => {
    const date = new Date()
    date.setMonth(idx)
    return formatDate(date, 'MMM')
  })

  const options = {
    chart: {
      type: 'column',
      height: 200
    },
    title: {
      text: 'Popular times'
    },
    xAxis: {
      categories,
      crosshair: true
    },
    yAxis: [
      { title: { text: null }, visible: false },
      { title: { text: null }, visible: false },
      {
        title: { text: null },
        min: 0,
        max: 200,
        tickAmount: 4,
        labels: { enabled: false }
      }
    ],
    tooltip: {
      shared: true
    },
    plotOptions: {
      series: {
        borderRadius: 8,
        pointWidth: 16
      }
    },
    series: [
      {
        name: 'Tracks recorded',
        yAxis: 0,
        color: Highcharts.getOptions().colors?.[0],
        data: new Array(12)
          .fill(undefined)
          .map((_val, idx) => popularTimes[String(idx + 1)].trackCount)
      },
      {
        name: 'People visited',
        yAxis: 1,
        color: Highcharts.getOptions().colors?.[8],
        data: new Array(12)
          .fill(undefined)
          .map((_val, idx) => popularTimes[String(idx + 1)].peopleCount)
      }
    ],
    credits: {
      enabled: false
    }
  }

  return <Highchart options={options} />
}

export default PopularTimes
