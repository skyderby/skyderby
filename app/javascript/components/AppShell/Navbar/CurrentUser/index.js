import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const CurrentUser = ({ user }) => {
  const {
    photo: { thumb },
    profileId
  } = user

  return (
    <Link to={`/profiles/${profileId}`} className={styles.profileLink}>
      <img src={thumb} />
    </Link>
  )
}

CurrentUser.propTypes = {
  user: PropTypes.shape({
    photo: PropTypes.shape({
      thumb: PropTypes.string.isRequired
    }).isRequired,
    profileId: PropTypes.number.isRequired
  }).isRequired
}

export default CurrentUser
