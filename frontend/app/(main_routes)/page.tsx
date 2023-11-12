import React from 'react'
import getCurrentUser from 'api/getCurrentUser'
import LandingPage from './LandingPage'
import UserDashboard from './UserDashboard'

const Page = async () => {
  const currentUser = await getCurrentUser()

  if (currentUser?.authorized) {
    return <UserDashboard currentUser={currentUser} />
  } else {
    return <LandingPage />
  }
}

export default Page
