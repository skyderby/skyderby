import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import debounce from 'lodash.debounce'

import { useUsersQuery, useBatchDeleteUsersMutation } from 'api/users'
import { useI18n } from 'components/TranslationsProvider'
import Pagination from 'components/Pagination'
import styles from './styles.module.scss'

const UsersIndex = (): JSX.Element => {
  const { formatDate } = useI18n()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const searchTerm = searchParams.get('searchTerm') || undefined
  const { data } = useUsersQuery({ page, searchTerm })
  const users = data.items
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  useEffect(() => {
    setSelectedIds(new Set())
  }, [users])
  const batchDeleteMutation = useBatchDeleteUsersMutation()

  const pagination = { page: data.currentPage, totalPages: data.totalPages }

  const buildUrl = useCallback(
    ({ page }: { page: number }) => {
      const urlParams = new URLSearchParams(searchParams)
      if (page === 1) {
        urlParams.delete('page')
      } else {
        urlParams.set('page', page.toString())
      }

      return urlParams.toString()
    },
    [searchParams]
  )

  const handleSearchChange = debounce(event => {
    if (!event.target.value) {
      searchParams.delete('searchTerm')
    } else {
      searchParams.set('searchTerm', event.target.value)
    }
    searchParams.delete('page')
    setSearchParams(searchParams)
  }, 200)

  const currentPath = [location.pathname, location.search].filter(Boolean).join('')

  const toggleAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(new Set(users.map(user => user.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const toggleUser = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (event.target.checked) {
      setSelectedIds(ids => new Set([...ids, id]))
    } else {
      setSelectedIds(ids => new Set([...ids].filter(_id => _id !== id)))
    }
  }

  const batchDelete = (event: React.MouseEvent) => {
    const target = event.target as HTMLButtonElement
    target.innerText = 'Deleting users..'

    batchDeleteMutation.mutate(Array.from(selectedIds), {
      onSuccess: () => toast.success(`Successfully deleted ${selectedIds.size} users`)
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        {selectedIds.size > 0 ? (
          <div className={styles.batchActions}>
            <button className={styles.batchAction} onClick={batchDelete}>
              Delete {selectedIds.size} users
            </button>
          </div>
        ) : (
          <input
            className={styles.input}
            type="search"
            name="searchTerm"
            defaultValue={searchTerm ?? ''}
            placeholder="Search users by id, name, email"
            onChange={handleSearchChange}
          />
        )}
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.table} role="table">
          <div className={styles.thead} role="rowgroup">
            <div className={styles.row} role="rowheader">
              <div className={styles.cell} role="cell">
                <label
                  htmlFor="selectAll"
                  aria-label="Select all users"
                  className={styles.checkboxLabel}
                >
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={
                      selectedIds.size > 0 &&
                      users.every(user => selectedIds.has(user.id))
                    }
                    onChange={toggleAll}
                  />
                </label>
              </div>
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
              <div className={styles.cell} role="cell">
                Sign in count
              </div>
            </div>
          </div>
          <div className={styles.tbody} role="rowgroup">
            {users.map(user => (
              <div key={user.id} className={styles.row} role="row">
                <div className={styles.cell} role="cell">
                  <label
                    htmlFor={`select_user_${user.id}`}
                    className={styles.checkboxLabel}
                    aria-label={`Select user "${user.name} (#${user.id})"`}
                  >
                    <input
                      type="checkbox"
                      id={`select_user_${user.id}`}
                      checked={selectedIds.has(user.id)}
                      onChange={e => toggleUser(e, user.id)}
                    />
                  </label>
                </div>
                <div className={styles.cell} role="cell">
                  {user.id}
                </div>
                <div className={styles.cell} role="cell">
                  {!user.confirmed && '👾'}
                </div>
                <div className={styles.cell} role="cell">
                  <Link
                    to={user.id.toString()}
                    className={styles.link}
                    state={{ returnTo: currentPath }}
                  >
                    {user.name || <>&mdash;</>}
                  </Link>
                </div>
                <div className={styles.cell} role="cell">
                  {user.email}
                </div>
                <div className={styles.cell} role="cell">
                  {formatDate(user.createdAt, 'dd MMM yyyy')}
                </div>
                <div className={styles.cell} role="cell">
                  {user.signInCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pagination && <Pagination buildUrl={buildUrl} {...pagination} />}
    </div>
  )
}

export default UsersIndex
