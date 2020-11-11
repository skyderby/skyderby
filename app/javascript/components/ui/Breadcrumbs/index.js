import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import ChevronRight from 'icons/chevron-right'

import styles from './styles.module.scss'

const Item = props => <li {...props} />

const Breadcrumbs = ({ children }) => (
  <ul className={styles.container}>
    {Array.isArray(children)
      ? children.map((node, idx) => (
          <Fragment key={idx}>
            {node}
            {idx < children.length - 1 && <ChevronRight />}
          </Fragment>
        ))
      : { children }}
  </ul>
)

Breadcrumbs.Item = Item

Breadcrumbs.propTypes = {
  children: PropTypes.node.isRequired
}

export default Breadcrumbs
