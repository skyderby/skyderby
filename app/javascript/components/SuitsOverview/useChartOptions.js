import { useMemo } from 'react'
import Highcharts from 'highcharts'

const baseOptions = {
  chart: {
    type: 'pie'
  },
  title: {
    text: 'Suits popularity among people for last year'
  },
  plotOptions: {
    pie: {
      shadow: false,
      center: ['50%', '50%']
    }
  },
  tooltip: {
    valueSuffix: '%'
  },
  credits: {
    enabled: false
  }
}

const getManufacturerShare = suits => suits.reduce((acc, val) => acc + val.popularity, 0)

const buildSeries = (suitsPopularity, manufacturers) => {
  if (suitsPopularity.length === 0 || manufacturers.length === 0) return []

  const groupedByManufacturer = suitsPopularity.reduce((acc, suit) => {
    acc[suit.makeId] = acc[suit.makeId] || []
    acc[suit.makeId].push(suit)

    return acc
  }, {})

  const manufacturersOrder = Object.keys(groupedByManufacturer).sort(
    (firstId, secondId) => {
      const firstShare = getManufacturerShare(groupedByManufacturer[firstId])
      const secondShare = getManufacturerShare(groupedByManufacturer[secondId])

      return secondShare - firstShare
    }
  )

  const manufacturersData = manufacturersOrder.map((makeId, idx) => {
    const suits = groupedByManufacturer[makeId]

    return {
      name: manufacturers.find(el => el.id === Number(makeId)).name,
      y: Math.round(suits.reduce((acc, val) => acc + val.popularity, 0) * 100) / 100,
      color: Highcharts.getOptions().colors[idx]
    }
  })

  const suitsData = manufacturersOrder
    .map((makeId, makeIdx) => {
      const suits = groupedByManufacturer[makeId]

      return suits.map((suit, suitIdx) => ({
        name: suit.name,
        y: suit.popularity,
        color: Highcharts.Color(Highcharts.getOptions().colors[makeIdx])
          .brighten(suitIdx / suits.length / 5)
          .get()
      }))
    })
    .flat()

  return [
    {
      name: 'Manufacturer share',
      size: '60%',
      data: manufacturersData,
      dataLabels: {
        formatter: function () {
          return this.y > 5 ? this.point.name : null
        },
        color: '#ffffff',
        distance: -60
      }
    },
    {
      name: 'Suit share',
      data: suitsData,
      size: '80%',
      innerSize: '60%',
      dataLabels: {
        formatter: function () {
          return this.y > 1
            ? `<b>${this.point.name}:</b> ${Math.round(this.y * 10) / 10}%`
            : null
        }
      }
    }
  ]
}

const useChartOptions = (suitsPopularity = [], manufacturers = []) => {
  const series = useMemo(() => buildSeries(suitsPopularity, manufacturers), [
    suitsPopularity,
    manufacturers
  ])

  const options = useMemo(() => ({ ...baseOptions, series }), [series])

  return options
}

export default useChartOptions
