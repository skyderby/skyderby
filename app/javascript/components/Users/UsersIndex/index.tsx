import React, { useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Location } from 'history'
import debounce from 'lodash.debounce'

import { useUsersQuery, mapParamsToUrl, IndexParams } from 'api/users'
import AppShell from 'components/AppShell'
import { useI18n } from 'components/TranslationsProvider'
import Pagination from 'components/Pagination'
import styles from './styles.module.scss'

const extractParamsFromUrl = (location: Location): IndexParams => {
  const urlParams = new URLSearchParams(location.search)
  const page = Number(urlParams.get('page')) || 1
  const searchTerm = urlParams.get('searchTerm') || undefined

  return { page, searchTerm }
}

const UsersIndex = (): JSX.Element => {
  const navigate = useNavigate()
  const location = useLocation()
  const { formatDate } = useI18n()
  const urlParams = useMemo(() => extractParamsFromUrl(location), [location])
  const { data, isLoading } = useUsersQuery(urlParams)
  const users = data?.items ?? []
  const pagination = isLoading
    ? null
    : { page: data?.currentPage, totalPages: data?.totalPages }

  const buildUrl = useCallback(params => mapParamsToUrl({ ...urlParams, ...params }), [
    urlParams
  ])

  const handleSearchChange = debounce(event => {
    const urlParams = mapParamsToUrl({ searchTerm: event.target.value, page: 1 })
    navigate(location.pathname + urlParams)
  }, 200)

  return (
    <AppShell>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Users</h1>
          <input
            className={styles.input}
            type="search"
            name="searchTerm"
            placeholder="Search users by id, name, email"
            onChange={handleSearchChange}
          />
        </div>

        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th title="Confirmed" />
                <th>Name</th>
                <th>E-mail</th>
                <th>Signed up</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{!user.confirmed && '👾'}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.createdAt, 'dd MMM yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && <Pagination buildUrl={buildUrl} {...pagination} />}
      </div>
    </AppShell>
  )
}

export default UsersIndex
