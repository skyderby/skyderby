import React from 'react'
import { Link } from 'react-router-dom'

import AppShell from 'components/AppShell'
import styles from './styles.module.scss'
import { AxiosError } from 'axios'

type ErrorPageProps = {
  title: string
  description: string
  linkBack?: string
}

const ErrorPage = ({ title, description, linkBack }: ErrorPageProps): JSX.Element => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>

      {linkBack && (
        <Link to={linkBack} className={styles.primaryButton}>
          Go back
        </Link>
      )}
    </div>
  )
}

const Forbidden = (props: Omit<ErrorPageProps, 'title' | 'description'>): JSX.Element => (
  <ErrorPage
    title="🙈 Oops. 🙈"
    description="You're not allowed to view this page."
    {...props}
  />
)

const NotFound = (props: Omit<ErrorPageProps, 'title' | 'description'>): JSX.Element => (
  <ErrorPage title="📡 #404" description="Page you're looking for not found" {...props} />
)

const UnknownError = (
  props: Omit<ErrorPageProps, 'title' | 'description'>
): JSX.Element => (
  <ErrorPage title="🤦 Oops" description="Something went wrong" {...props} />
)

interface PageParams {
  linkBack?: string
}

const forError = (error: AxiosError | null, { linkBack }: PageParams): JSX.Element => {
  if (error?.response?.status === 403) return <Forbidden linkBack={linkBack} />
  if (error?.response?.status === 404) return <NotFound linkBack={linkBack} />

  return <UnknownError linkBack={linkBack} />
}

export default Object.assign(ErrorPage, { Forbidden, NotFound, forError })
