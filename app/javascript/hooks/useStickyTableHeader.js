import { useCallback, useLayoutEffect, useState } from 'react'

const syncHeaderCellsWidth = (source, destination) => {
  const original_cells = source.querySelectorAll('th')
  destination.style.width = source.getBoundingClientRect().width + 'px'

  destination.querySelectorAll('th').forEach((el, index) => {
    el.style.width = original_cells[index].getBoundingClientRect().width + 'px'
  })
}

const useStickyTableHeader = (tableRef, containerRef) => {
  const [isSticky, setIsSticky] = useState(false)

  const tableParent = tableRef.current?.parentElement

  const handleScroll = useCallback(() => {
    if (!tableRef.current) return

    const currentOffset = document.scrollingElement.scrollTop
    const tableHeaderHeight = tableRef.current.querySelector('thead').offsetHeight
    const tableOffsetTop = tableRef.current.getBoundingClientRect().top + pageYOffset
    const tableOffsetBottom =
      tableRef.current.getBoundingClientRect().bottom + pageYOffset - tableHeaderHeight

    const shouldDisplayStickyHeader =
      currentOffset >= tableOffsetTop && currentOffset <= tableOffsetBottom

    if (shouldDisplayStickyHeader !== isSticky) {
      setIsSticky(shouldDisplayStickyHeader)
    }
  }, [setIsSticky, isSticky, tableRef])

  const handleResize = useCallback(() => {
    syncHeaderCellsWidth(tableRef.current, containerRef.current)
  }, [tableRef, containerRef])

  const handleHorizontalScroll = useCallback(() => {
    if (!isSticky || !tableParent) return

    const tableClone = containerRef.current.querySelector('table')
    tableClone.style.transform = `translateX(-${tableParent.scrollLeft}px)`
  }, [tableParent, isSticky, containerRef])

  useLayoutEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [handleScroll, handleResize])

  useLayoutEffect(() => {
    tableParent?.addEventListener('scroll', handleHorizontalScroll, {
      passive: true
    })

    return () => tableParent?.removeEventListener('scroll', handleHorizontalScroll)
  }, [tableParent, handleHorizontalScroll])

  useLayoutEffect(() => {
    if (!isSticky || !tableRef.current || !containerRef.current) return

    syncHeaderCellsWidth(tableRef.current, containerRef.current)
    handleHorizontalScroll()
  }, [isSticky, tableParent, tableRef, containerRef, handleHorizontalScroll])

  return isSticky
}

export default useStickyTableHeader
