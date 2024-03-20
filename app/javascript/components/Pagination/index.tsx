import React from 'react'
import cx from 'clsx'
import { Link, useLocation } from 'react-router-dom'

import IconChevronLeft from 'icons/chevron-left.svg'
import IconChevronRight from 'icons/chevron-right.svg'

import { showLinkOnDesktop } from './utils'
import styles from './styles.module.scss'

type PaginationProps = {
  page?: number
  totalPages?: number
  buildUrl: (params: { page: number }) => string
}

const Pagination = ({
  page = 1,
  totalPages = 0,
  buildUrl
}: PaginationProps): JSX.Element | null => {
  const location = useLocation()
  if (Number(totalPages) < 2) return null

  const showAround = 3
  const startIndex = Math.max(page - showAround, 1)
  const endIndex = Math.min(startIndex + showAround * 2, totalPages)

  const pages = Array.from(
    { length: endIndex - startIndex + 1 },
    (_, idx) => startIndex + idx
  )

  return (
    <div className={styles.container}>
      <Link
        className={styles.page}
        to={{
          ...location,
          search: buildUrl({ page: Math.max(page - 1, 1) })
        }}
      >
        <div className={styles.arrow}>
          <IconChevronLeft />
        </div>
      </Link>

      {pages.map(idx => (
        <Link
          className={cx(
            styles.page,
            showLinkOnDesktop(page, idx, totalPages) && styles.desktop
          )}
          to={{ ...location, search: buildUrl({ page: idx }) }}
          key={idx}
          data-active={page === idx}
        >
          {idx}
        </Link>
      ))}

      <Link
        className={styles.page}
        to={{
          ...location,
          search: buildUrl({ page: Math.min(page + 1, totalPages) })
        }}
      >
        <div className={styles.arrow}>
          <IconChevronRight />
        </div>
      </Link>
    </div>
  )
}

export default Pagination
