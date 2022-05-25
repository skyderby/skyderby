import React from 'react'
import Highchart from 'components/Highchart'
import { PlaceStats } from 'api/places'
import { useI18n } from 'components/TranslationsProvider'
import colors from 'utils/colors'

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
      column: {
        borderRadius: 8,
        pointWidth: 16
      }
    },
    series: [
      {
        name: 'Tracks recorded',
        type: 'column' as const,
        yAxis: 0,
        color: colors[0],
        data: new Array(12)
          .fill(undefined)
          .map((_val, idx) => popularTimes[String(idx + 1)].trackCount)
      },
      {
        name: 'People visited',
        type: 'column' as const,
        yAxis: 1,
        color: colors[4],
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
