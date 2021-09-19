import { mapParamsToUrl, extractParamsFromUrl } from 'api/hooks/tracks'

describe('Index params', () => {
  describe('#mapToUrl', () => {
    const defaultParams = {
      activity: undefined,
      page: 1,
      filters: []
    }

    it('default params', () => {
      const result = mapParamsToUrl(defaultParams)

      expect(result).toEqual('')
    })

    it('with page > 1', () => {
      const result = mapParamsToUrl({ ...defaultParams, page: 2 })

      expect(result).toEqual('?page=2')
    })

    it('with filters', () => {
      const result = mapParamsToUrl({
        ...defaultParams,
        filters: [
          ['year', 2018],
          ['year', 2020]
        ]
      })

      expect(decodeURIComponent(result)).toEqual('?year[]=2018&year[]=2020')
    })

    it('with prefix', () => {
      const result = mapParamsToUrl(
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
      const result = extractParamsFromUrl(
        '?year[]=2018&profileId[]=3&year[]=2020&page=2&sortBy=id+asc'
      )

      expect(result).toEqual({
        activity: undefined,
        page: 2,
        perPage: 20,
        sortBy: 'id asc',
        filters: [
          ['year', '2018'],
          ['profileId', '3'],
          ['year', '2020']
        ]
      })
    })

    it('with prefix', () => {
      const result = extractParamsFromUrl(
        '?tracks[year][]=2018&tracks[profileId][]=3&tracks[year][]=2020&tracks[page]=2&tracks[sortBy]=id+asc',
        'tracks'
      )

      expect(result).toEqual({
        activity: undefined,
        page: 2,
        perPage: 20,
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
