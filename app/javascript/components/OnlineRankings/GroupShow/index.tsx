import React from 'react'
import useGroupStandingsQuery from 'api/onlineRankings/groups/useGroupStandingsQuery'

const GroupShow = () => {
  const { data, isSuccess } = useGroupStandingsQuery()

  if (isSuccess) {
    return <></>
  }
  return <h1>Group show</h1>
}

export default GroupShow
