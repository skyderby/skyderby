import React from 'react'
import { Routes, Route } from 'react-router-dom'
import RankingsIndex from './RankingsIndex'
import GroupShow from './GroupShow'
import OnlineRankingShow from './OnlineRankingShow'
import ErrorPage from 'components/ErrorPage'

const OnlineRankings = () => {
  return (
    <Routes>
      <Route index element={<RankingsIndex />} />
      <Route path=":id" element={<OnlineRankingShow />} />
      <Route path="groups/:groupId" element={<GroupShow />} />
      <Route path="*" element={<ErrorPage.NotFound />} />
    </Routes>
  )
}

export default OnlineRankings
