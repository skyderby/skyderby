import React from 'react'
import { OnlineRanking } from 'api/onlineRankings'
import { useLocation, useParams } from 'react-router-dom'
import { useAnnualStandingsQuery } from 'api/onlineRankings'
import Podium from 'components/OnlineRankings/OnlineRankingShow/Podium'
import Scoreboard from 'components/OnlineRankings/OnlineRankingShow/Scoreboard'
import Pagination from 'components/Pagination'

type Props = {
  onlineRanking: OnlineRanking
}

const Year = ({ onlineRanking }: Props) => {
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const page = Number(urlParams.get('page')) || 1

  const params = useParams()
  const year = Number(params.year)

  const {
    data: { data: standings, totalPages, currentPage }
  } = useAnnualStandingsQuery(onlineRanking.id, year, { page })

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

export default Year
