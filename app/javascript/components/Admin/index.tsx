import React from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'

import { useCurrentUserQuery } from 'api/sessions'
import ErrorPage from 'components/ErrorPage'
import Dashboard from './Dashboard'
import Contributions from './Contributions'
import styles from './styles.module.scss'

const Admin = () => {
  const { data: currentUser, isLoading } = useCurrentUserQuery()

  if (isLoading) return null

  if (!currentUser?.permissions?.canAccessAdminPanel) return <ErrorPage.Forbidden />

  return (
    <div className={styles.container}>
      <aside>
        <ul>
          <li>
            <NavLink end to="">
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink end to="contributions">
              Contributions
            </NavLink>
          </li>
        </ul>
      </aside>
      <main>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="contributions/*" element={<Contributions />} />
        </Routes>
      </main>
    </div>
  )
}

export default Admin
