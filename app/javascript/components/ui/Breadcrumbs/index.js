import React, { Fragment } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import ChevronRight from 'icons/chevron-right'

const BreadcrumbsContainer = styled.ul`
  align-items: center;
  display: flex;
  font-family: 'Proxima Nova Regular';
  margin: 0;
  padding: 0.5rem 0;

  svg {
    height: 0.5em;
  }

  > :not(:last-child) {
    margin-right: 0.5em;
  }
`

const Item = styled.li``

const Breadcrumbs = ({ children }) => (
  <BreadcrumbsContainer>
    {Array.isArray(children)
      ? children.map((node, idx) => (
          <Fragment key={idx}>
            {node}
            {idx < children.length - 1 && <ChevronRight />}
          </Fragment>
        ))
      : { children }}
  </BreadcrumbsContainer>
)

Breadcrumbs.Item = Item

Breadcrumbs.propTypes = {
  children: PropTypes.node.isRequired
}

export default Breadcrumbs
