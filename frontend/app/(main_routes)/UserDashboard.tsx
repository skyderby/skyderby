import React from 'react'

type Props = {
  currentUser: {
    name: string
  }
}
const UserDashboard = ({ currentUser }: Props) => {
  return <h1>Hello, {currentUser.name}</h1>
}

export default UserDashboard
