'use client'

import React from 'react'

import ExitIcon from 'icons/exit.svg'
import styles from './styles.module.scss'

type Props = {
  title: string
  action: () => Promise<void>
}

const LogoutButton = ({ title, action }: Props) => {
  return (
    <form action={action}>
      <button className={styles.logoutButton} title={title}>
        <ExitIcon />
      </button>
    </form>
  )
}

export default LogoutButton
