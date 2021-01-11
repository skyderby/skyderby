import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import ChevronRight from 'icons/chevron-right.svg'

import styles from './styles.module.scss'

const Item = props => <li {...props} />

const Breadcrumbs = ({ children }) => {
  const elements = [children].flat()

  return (
    <ul className={styles.container}>
      {elements.map((node, idx) => (
        <Fragment key={idx}>
          {idx > 0 && (
            <li>
              <ChevronRight />
            </li>
          )}

          {node}
        </Fragment>
      ))}
    </ul>
  )
}

Breadcrumbs.Item = Item

Breadcrumbs.propTypes = {
  children: PropTypes.node.isRequired
}

export default Breadcrumbs
