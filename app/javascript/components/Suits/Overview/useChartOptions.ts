import { useMemo } from 'react'
import Highcharts, { PointLabelObject, Options } from 'highcharts'
import { SuitsPopularityRecord } from 'api/hooks/suitsPopularity'
import { SuitRecord } from 'api/hooks/suits'
import { ManufacturerRecord } from 'api/hooks/manufacturer'

const baseOptions: Options = {
  chart: {
    type: 'pie'
  },
  title: {
    text: 'Suits popularity among people for last year'
  },
  plotOptions: {
    pie: {
      shadow: false,
      center: ['50%', '50%'] as [string, string]
    }
  },
  tooltip: {
    valueSuffix: '%'
  },
  credits: {
    enabled: false
  }
}

type SuitWithPopularity = SuitRecord & Pick<SuitsPopularityRecord, 'popularity'>

const getManufacturerShare = (suits: SuitWithPopularity[]): number =>
  suits.reduce<number>((acc, val) => acc + val.popularity, 0)

const buildSeries = (
  suitsWithPopularity: SuitWithPopularity[],
  manufacturers: ManufacturerRecord[]
) => {
  if (suitsWithPopularity.length === 0 || manufacturers.length === 0) return []

  const groupedByManufacturer = suitsWithPopularity.reduce<
    Record<string, SuitWithPopularity[]>
  >((acc, suit) => {
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
      name: manufacturers.find(el => el.id === Number(makeId))?.name,
      y:
        Math.round(suits.reduce<number>((acc, val) => acc + val.popularity, 0) * 100) /
        100,
      color: Highcharts.getOptions().colors?.[idx]
    }
  })

  const suitsData = manufacturersOrder
    .map((makeId, makeIdx) => {
      const suits = groupedByManufacturer[makeId]

      return suits.map((suit, suitIdx) => ({
        name: suit.name,
        y: suit.popularity,
        color: new Highcharts.Color(Highcharts.getOptions().colors?.[makeIdx] ?? '#000')
          .brighten(suitIdx / suits.length / 5)
          .get()
      }))
    })
    .flat()

  return [
    {
      name: 'Manufacturer share',
      type: 'pie' as const,
      size: '60%',
      data: manufacturersData,
      dataLabels: {
        formatter: function (this: PointLabelObject) {
          const valuePercent = this.y ?? 0
          return valuePercent > 5 ? this.point.name : null
        },
        color: '#ffffff',
        distance: -60
      }
    },
    {
      name: 'Suit share',
      type: 'pie' as const,
      data: suitsData,
      size: '80%',
      innerSize: '60%',
      dataLabels: {
        formatter: function (this: PointLabelObject) {
          const valuePercent = this.y ?? 0
          return valuePercent > 1
            ? `<b>${this.point.name}:</b> ${Math.round(valuePercent * 10) / 10}%`
            : null
        }
      }
    }
  ]
}

const useChartOptions = (
  suits: SuitRecord[] = [],
  suitsPopularity: SuitsPopularityRecord[] = [],
  manufacturers: ManufacturerRecord[] = []
): Options => {
  const suitsWithPopularity = suits.map(suit => ({
    ...suit,
    popularity: suitsPopularity.find(el => el.suitId === suit.id)?.popularity ?? 0
  }))

  const series = useMemo(() => buildSeries(suitsWithPopularity, manufacturers), [
    suits,
    suitsPopularity,
    manufacturers
  ])

  return useMemo(() => ({ ...baseOptions, series }), [series])
}

export default useChartOptions
