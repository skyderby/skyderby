import React from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'

import { useCurrentUserQuery } from 'api/sessions'
import ErrorPage from 'components/ErrorPage'
import Dashboard from './Dashboard'
import Contributions from './Contributions'
import Users from './Users'
import styles from './styles.module.scss'

const Admin = () => {
  const { data: currentUser, isLoading } = useCurrentUserQuery()

  if (isLoading) return null

  if (!currentUser?.permissions?.canAccessAdminPanel) return <ErrorPage.Forbidden />

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <ul className={styles.menu}>
          <li>
            <NavLink end to="">
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="contributions">Contributions</NavLink>
          </li>
          <li>
            <NavLink to="users">Users</NavLink>
          </li>
        </ul>
      </aside>
      <main className={styles.content}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="contributions/*" element={<Contributions />} />
          <Route path="users/*" element={<Users />} />
        </Routes>
      </main>
    </div>
  )
}

export default Admin
