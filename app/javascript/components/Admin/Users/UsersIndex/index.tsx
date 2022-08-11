import React, { useCallback, useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Location } from 'history'
import debounce from 'lodash.debounce'

import { useUsersQuery, mapParamsToUrl, IndexParams } from 'api/users'
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

  const buildUrl = useCallback(
    (params: Partial<IndexParams>) => mapParamsToUrl({ ...urlParams, ...params }),
    [urlParams]
  )

  const handleSearchChange = debounce(event => {
    const urlParams = mapParamsToUrl({ searchTerm: event.target.value, page: 1 })
    navigate(location.pathname + urlParams)
  }, 200)

  const currentPath = [location.pathname, location.search].filter(Boolean).join('')

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <input
          className={styles.input}
          type="search"
          name="searchTerm"
          defaultValue={urlParams.searchTerm?.toString()}
          placeholder="Search users by id, name, email"
          onChange={handleSearchChange}
        />
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.table} role="table">
          <div className={styles.thead} role="rowgroup">
            <div className={styles.row} role="rowheader">
              <div className={styles.cell} role="cell">
                #
              </div>
              <div className={styles.cell} title="Confirmed" role="cell" />
              <div className={styles.cell} role="cell">
                Name
              </div>
              <div className={styles.cell} role="cell">
                E-mail
              </div>
              <div className={styles.cell} role="cell">
                Signed up
              </div>
            </div>
          </div>
          <div className={styles.tbody} role="rowgroup">
            {users.map(user => (
              <Link
                to={user.id.toString()}
                className={styles.row}
                key={user.id}
                state={{ returnTo: currentPath }}
                role="row"
              >
                <div className={styles.cell} role="cell">
                  {user.id}
                </div>
                <div className={styles.cell} role="cell">
                  {!user.confirmed && '👾'}
                </div>
                <div className={styles.cell} role="cell">
                  {user.name}
                </div>
                <div className={styles.cell} role="cell">
                  {user.email}
                </div>
                <div className={styles.cell} role="cell">
                  {formatDate(user.createdAt, 'dd MMM yyyy')}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {pagination && <Pagination buildUrl={buildUrl} {...pagination} />}
    </div>
  )
}

export default UsersIndex
