import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useUserQuery, useDeleteUserMutation } from 'api/users'
import RequestErrorToast from 'components/RequestErrorToast'
import styles from './styles.module.scss'

const User = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const userId = Number(params.id)
  const { data: user, isSuccess } = useUserQuery(userId)
  const deleteMutation = useDeleteUserMutation(userId)
  const returnTo = location.state?.returnTo ?? '/admin/users'

  const performDelete = ({ destroyProfile }: { destroyProfile: boolean }) => {
    const confirmed = confirm(
      'This operation is not reversible. Are you sure you want to continue?'
    )

    if (!confirmed) return

    deleteMutation.mutate(
      { destroyProfile },
      {
        onSuccess: () => {
          navigate(returnTo)
        },
        onError: error => {
          toast.error(<RequestErrorToast response={error.response} />)
        }
      }
    )
  }

  const deleteUser = () => performDelete({ destroyProfile: false })
  const deleteUserWithProfile = () => performDelete({ destroyProfile: true })
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

        <hr />

        <div className={styles.actions}>
          <button className={styles.dangerButton} onClick={deleteUserWithProfile}>
            Delete user with associated profile
          </button>

          <button className={styles.dangerButton} onClick={deleteUser}>
            Delete user only
          </button>
        </div>
      </div>
    </div>
  )
}

export default User
