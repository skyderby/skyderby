import React from 'react'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const SuitLabel = ({ name, code }) => (
  <span>
    {code && <span className={styles.manufacturerCode}>{code}</span>}
    &nbsp;
    {name && <span>{name}</span>}
  </span>
)

SuitLabel.propTypes = {
  name: PropTypes.string,
  code: PropTypes.string
}

export default SuitLabel
