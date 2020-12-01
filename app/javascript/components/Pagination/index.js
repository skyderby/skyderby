import React from 'react'
import cx from 'clsx'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import IconChevronLeft from 'icons/chevron-left.svg'
import IconChevronRight from 'icons/chevron-right.svg'

import { showLinkOnDesktop } from './utils'
import styles from './styles.module.scss'

const Pagination = ({ page = 1, totalPages = 0, buildUrl }) => {
  if (Number(totalPages) < 2) return null

  const showAround = 3
  const startIndex = Math.max(page - showAround, 1)
  const endIndex = Math.min(startIndex + showAround * 2, totalPages)

  const pages = Array(endIndex - startIndex + 1)
    .fill()
    .map((_, idx) => startIndex + idx)

  return (
    <div className={styles.container}>
      <Link
        className={styles.page}
        to={location => ({
          ...location,
          search: buildUrl({ page: Math.max(page - 1, 1) })
        })}
        disabled={page === 1}
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
          to={location => ({ ...location, search: buildUrl({ page: idx }) })}
          key={idx}
          data-active={page === idx}
        >
          {idx}
        </Link>
      ))}

      <Link
        className={styles.page}
        to={location => ({
          ...location,
          search: buildUrl({ page: Math.min(page + 1, totalPages) })
        })}
      >
        <div className={styles.arrow}>
          <IconChevronRight />
        </div>
      </Link>
    </div>
  )
}

Pagination.propTypes = {
  page: PropTypes.number,
  totalPages: PropTypes.number,
  buildUrl: PropTypes.func.isRequired
}
export default Pagination
