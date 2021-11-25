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

interface PageParams {
  layout?: React.ComponentType
  linkBack?: string
}

const forError = (
  error: AxiosError,
  { layout: Layout = AppShell, linkBack }: PageParams
): JSX.Element => (
  <Layout>
    {error?.response?.status === 403 && <Forbidden linkBack={linkBack} />}
    {error?.response?.status === 404 && <NotFound linkBack={linkBack} />}
  </Layout>
)

export default Object.assign(ErrorPage, { Forbidden, NotFound, forError })
