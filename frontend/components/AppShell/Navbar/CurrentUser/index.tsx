import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import styles from './styles.module.scss'

type CurrentUserProps = {
  user: {
    photo: {
      thumb: string
    }
    profileId: number
  }
}

const CurrentUser = ({ user }: CurrentUserProps): JSX.Element => {
  const {
    photo: { thumb },
    profileId
  } = user

  return (
    <Link href={`/profiles/${profileId}`} className={styles.profileLink}>
      <Image src={thumb} height="34" width="34" alt="profile photo thumb" />
    </Link>
  )
}

export default CurrentUser
