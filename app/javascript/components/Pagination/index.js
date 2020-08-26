import React from 'react'
import PropTypes from 'prop-types'

import IconChevronLeft from 'icons/chevron-left.svg'
import IconChevronRight from 'icons/chevron-right.svg'

import { Container, Arrow, Page } from './elements'

const Pagination = ({ page = 1, totalPages = 0, showAround = 2, buildUrl }) => {
  const startIndex = Math.max(page - showAround, 1)
  const endIndex = Math.min(startIndex + showAround * 2, totalPages)

  const pages = Array(endIndex - startIndex + 1)
    .fill()
    .map((_, idx) => startIndex + idx)

  return (
    <Container>
      <Page
        to={location => ({
          ...location,
          search: buildUrl({ page: Math.max(page - 1, 1) })
        })}
        disabled={page === 1}
      >
        <Arrow>
          <IconChevronLeft />
        </Arrow>
      </Page>

      {pages.map(idx => (
        <Page
          to={location => ({ ...location, search: buildUrl({ page: idx }) })}
          key={idx}
          active={page === idx}
        >
          {idx}
        </Page>
      ))}

      <Page
        to={location => ({
          ...location,
          search: buildUrl({ page: Math.min(page + 1, totalPages) })
        })}
      >
        <Arrow>
          <IconChevronRight />
        </Arrow>
      </Page>
    </Container>
  )
}

Pagination.propTypes = {
  page: PropTypes.number,
  totalPages: PropTypes.number,
  showAround: PropTypes.number,
  buildUrl: PropTypes.func.isRequired
}
export default Pagination
