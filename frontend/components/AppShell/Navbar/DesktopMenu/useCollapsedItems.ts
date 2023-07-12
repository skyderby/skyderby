import React, { useLayoutEffect, useState } from 'react'
import isEqual from 'lodash.isequal'

// import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

type ItemWidth = {
  href: string
  width: number
}

const useItemWidths = (menuRef: React.RefObject<HTMLUListElement>) => {
  const locale = 'en'
  const [itemWidths, setItemWidths] = useState<ItemWidth[]>([])

  useLayoutEffect(() => {
    if (!menuRef.current) return

    const menuItems = menuRef.current.querySelectorAll<HTMLLIElement>(
      `.${styles.menuItem}`
    )

    setItemWidths(
      Array.from(menuItems).map(menuItem => {
        const href = menuItem.querySelector<HTMLAnchorElement>('a')?.getAttribute('href')
        if (!href) throw 'Unsupported list element'
        const width = menuItem.getBoundingClientRect().width

        return { href, width }
      })
    )
  }, [locale, menuRef])

  return itemWidths
}

const useCollapsedItems = (
  menuRef: React.RefObject<HTMLUListElement>,
  dropdownToggleRef: React.RefObject<HTMLLIElement>
) => {
  const itemWidths = useItemWidths(menuRef)
  const [collapsedItems, setCollapsedItems] = useState<string[]>([])

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!menuRef.current || !dropdownToggleRef.current) return
      const padding = 15

      const availableWidth =
        menuRef.current.getBoundingClientRect().width -
        dropdownToggleRef.current.getBoundingClientRect().width -
        padding

      const collapse: string[] = []
      itemWidths.reduce((widthLeft, item) => {
        const widthLeftWithCurrentElement = widthLeft - item.width
        if (widthLeftWithCurrentElement < 0) collapse.push(item.href)
        return widthLeftWithCurrentElement
      }, availableWidth)

      if (!isEqual(collapse, collapsedItems)) setCollapsedItems(collapse)
    }

    handleResize()
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [itemWidths, collapsedItems, setCollapsedItems, menuRef, dropdownToggleRef])

  const isCollapsed = (href: string) => collapsedItems.includes(href)

  return isCollapsed
}

export default useCollapsedItems
