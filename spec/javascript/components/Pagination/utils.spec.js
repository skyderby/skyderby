import { showLinkOnDesktop } from 'components/Pagination/utils'

describe('Pagination/showLinkOnDesktop', () => {
  it('first and last page is desktop only when current in the middle', () => {
    const activePage = 4
    const pageMap = {
      1: true,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: true
    }

    Object.entries(pageMap).forEach(([pageKey, shouldShow]) => {
      expect(showLinkOnDesktop(activePage, Number(pageKey), 100)).toEqual(shouldShow)
    })
  })

  it('when active page in the beginning', () => {
    const pageMap = {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: true,
      7: true
    }

    const activePage = 1
    const result = Object.fromEntries(
      Array(7)
        .fill()
        .map((_val, idx) => [idx + 1, showLinkOnDesktop(activePage, idx + 1, 100)])
    )

    expect(result).toEqual(pageMap)
  })

  it('when active page in the end', () => {
    const pageMap = {
      94: true,
      95: true,
      96: false,
      97: false,
      98: false,
      99: false,
      100: false
    }

    const activePage = 99
    const result = Object.fromEntries(
      Array(7)
        .fill()
        .map((_val, idx) => [idx + 94, showLinkOnDesktop(activePage, idx + 94, 100)])
    )

    expect(result).toEqual(pageMap)
  })
})
