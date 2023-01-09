import React from 'react'
import { Routes, Route } from 'react-router-dom'
import RankingsIndex from './RankingsIndex'
import ErrorPage from 'components/ErrorPage'

const OnlineRankings = () => {
  return (
    <Routes>
      <Route index element={<RankingsIndex />} />
      <Route path="*" element={<ErrorPage.NotFound />} />
    </Routes>
  )
}

export default OnlineRankings
