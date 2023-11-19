import React from 'react'
import { OnlineRanking, useIntervalStandingsQuery } from 'api/onlineRankings'
import { useLocation, useParams } from 'react-router-dom'
import Podium from 'components/OnlineRankings/OnlineRankingShow/Podium'
import Scoreboard from 'components/OnlineRankings/OnlineRankingShow/Scoreboard'
import Pagination from 'components/Pagination'

type Props = {
  onlineRanking: OnlineRanking
}

const Interval = ({ onlineRanking }: Props) => {
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const page = Number(urlParams.get('page')) || 1

  const params = useParams()
  const slug = String(params.slug)

  const {
    data: { data: standings, totalPages, currentPage }
  } = useIntervalStandingsQuery(onlineRanking.id, slug, { page })

  const showPodium = currentPage === 1 && standings.length >= 3

  return (
    <>
      {showPodium && <Podium standings={standings} onlineRanking={onlineRanking} />}
      <Scoreboard onlineRanking={onlineRanking} standings={standings} />
      <Pagination
        totalPages={totalPages}
        page={currentPage}
        buildUrl={({ page }) => `?page=${page}`}
      />
    </>
  )
}

export default Interval
