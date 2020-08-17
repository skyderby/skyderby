import { IndexParams } from 'api/Track'

describe('Index params', () => {
  describe('#mapToUrl', () => {
    const defaultParams = {
      activity: undefined,
      page: 1,
      filters: []
    }

    it('default params', () => {
      const result = IndexParams.mapToUrl(defaultParams)

      expect(result).toEqual('')
    })

    it('with page > 1', () => {
      const result = IndexParams.mapToUrl({ ...defaultParams, page: 2 })

      expect(result).toEqual('?page=2')
    })

    it('with filters', () => {
      const result = IndexParams.mapToUrl({
        ...defaultParams,
        filters: [
          ['year', 2018],
          ['year', 2020]
        ]
      })

      expect(decodeURIComponent(result)).toEqual('?year[]=2018&year[]=2020')
    })

    it('with prefix', () => {
      const result = IndexParams.mapToUrl(
        {
          ...defaultParams,
          page: 2,
          filters: [
            ['year', 2018],
            ['year', 2020]
          ]
        },
        'tracks'
      )

      expect(decodeURIComponent(result)).toEqual(
        '?tracks[page]=2&tracks[year][]=2018&tracks[year][]=2020'
      )
    })
  })

  describe('#extractFromUrl', () => {
    it('without prefix', () => {
      const result = IndexParams.extractFromUrl(
        '?year[]=2018&profileId[]=3&year[]=2020&page=2&sortBy=id+asc'
      )

      expect(result).toEqual({
        activity: null,
        page: '2',
        perPage: 25,
        sortBy: 'id asc',
        filters: [
          ['year', '2018'],
          ['profileId', '3'],
          ['year', '2020']
        ]
      })
    })

    it('with prefix', () => {
      const result = IndexParams.extractFromUrl(
        '?tracks[year][]=2018&tracks[profileId][]=3&tracks[year][]=2020&tracks[page]=2&tracks[sortBy]=id+asc',
        'tracks'
      )

      expect(result).toEqual({
        activity: null,
        page: '2',
        perPage: 25,
        sortBy: 'id asc',
        filters: [
          ['year', '2018'],
          ['profileId', '3'],
          ['year', '2020']
        ]
      })
    })
  })
})
