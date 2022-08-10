import React from 'react'
import { useParams } from 'react-router-dom'

import { useUserQuery } from 'api/users'
import styles from './styles.module.scss'

const User = () => {
  const params = useParams()
  const userId = Number(params.id)
  const { data: user, isSuccess } = useUserQuery(userId)

  if (!isSuccess) return null

  return (
    <div>
      <h1>
        #{user.id} - {user.name}
      </h1>
      <div className={styles.container}>
        <h2>User account info</h2>
        <dl>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Sign in count</dt>
          <dd>{user.signInCount}</dd>
          <dt>Current sign in at</dt>
          <dd>{user.currentSignInAt?.toLocaleString()}</dd>
          <dt>Current sign in IP</dt>
          <dd>{user.currentSignInIp}</dd>
          <dt>Last sign in at</dt>
          <dd>{user.lastSignInAt?.toLocaleString()}</dd>
          <dt>Last sign in IP</dt>
          <dd>{user.lastSignInIp}</dd>
        </dl>

        <h2>Profile info</h2>
        <dl>
          <dt>Name</dt>
          <dd>{user.name}</dd>
          <dt>Country</dt>
          <dd>{user.country || 'Not specified'}</dd>
          <dt>Track count</dt>
          <dd>{user.trackCount}</dd>
        </dl>
      </div>
    </div>
  )
}

export default User
