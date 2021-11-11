import React, { memo } from 'react'
import { Link } from 'react-router-dom'

import { AuthorizedUser } from 'api/sessions'
import styles from './styles.module.scss'

type CurrentUserProps = {
  user: AuthorizedUser
}

const CurrentUser = ({ user }: CurrentUserProps): JSX.Element => {
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

const userIdEqual = (prevProps: CurrentUserProps, nextProps: CurrentUserProps): boolean =>
  prevProps.user?.userId === nextProps.user?.userId

export default memo(CurrentUser, userIdEqual)
