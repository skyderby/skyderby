import React from 'react'
import { useLocation } from 'react-router-dom'
import { OnlineRanking, useOverallStandingsQuery } from 'api/onlineRankings'
import Pagination from 'components/Pagination'
import Scoreboard from './Scoreboard'
import Podium from './Podium'

type Props = {
  onlineRanking: OnlineRanking
}

const Overall = ({ onlineRanking }: Props) => {
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const page = Number(urlParams.get('page')) || 1

  const {
    data: { data: standings, totalPages, currentPage }
  } = useOverallStandingsQuery(onlineRanking.id, { page })

  return (
    <>
      {currentPage === 1 && standings.length >= 3 && (
        <Podium standings={standings} onlineRanking={onlineRanking} />
      )}
      <Scoreboard onlineRanking={onlineRanking} standings={standings} />
      <Pagination
        totalPages={totalPages}
        page={currentPage}
        buildUrl={({ page }) => `?page=${page}`}
      />
    </>
  )
}

export default Overall
