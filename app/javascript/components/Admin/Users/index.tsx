import React from 'react'
import { Route, Routes } from 'react-router-dom'

import UsersIndex from './UsersIndex'
import User from './User'

const Users = () => (
  <Routes>
    <Route index element={<UsersIndex />} />
    <Route path=":id" element={<User />} />
  </Routes>
)

export default Users
