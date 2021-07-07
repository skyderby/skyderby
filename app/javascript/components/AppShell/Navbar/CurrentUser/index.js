import React, { memo } from 'react'
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
      <img src={thumb} height="34" width="34" alt="profile photo thumb" />
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

const userIdEqual = (prevProps, nextProps) => prevProps.user?.id === nextProps.user?.id

export default memo(CurrentUser, userIdEqual)
