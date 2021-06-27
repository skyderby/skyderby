import React from 'react'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const Group = ({ name, selectable, children, onToggle: toggleGroup }) => (
  <div className={styles.group}>
    <div className={styles.header}>
      <span>{name}</span>
      {selectable && (
        <button className={styles.flatButton} onClick={toggleGroup}>
          Select
        </button>
      )}
    </div>
    <div className={styles.list}>{children}</div>
  </div>
)

Group.propTypes = {
  name: PropTypes.string.isRequired,
  selectable: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  children: PropTypes.node
}

export default Group
