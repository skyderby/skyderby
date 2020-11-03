import React from 'react'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const PlaceLabel = ({ name, code }) => (
  <span>
    {name && <span>{name}</span>}
    {code && (
      <>
        &nbsp;
        <span className={styles.separator}>{'//'}</span>
        &nbsp;
        <span className={styles.countryCode}>{code}</span>
      </>
    )}
  </span>
)

PlaceLabel.propTypes = {
  name: PropTypes.string,
  code: PropTypes.string
}

export default PlaceLabel
