import React from 'react'
import { useProfileQuery } from 'api/profiles'
import { OnlineRanking } from 'api/onlineRankings'
import { GroupStandingsRow } from 'api/onlineRankings/groups'

const formatResult = (result: number | undefined, task: OnlineRanking['discipline']) => {
  if (!result) return

  return result.toFixed(task === 'distance' ? 0 : 1)
}

type Props = {
  row: GroupStandingsRow
  tasks: OnlineRanking['discipline'][]
}

const StandingRow = ({ row, tasks }: Props) => {
  const { data: profile } = useProfileQuery(row.profileId, { enabled: false })

  return (
    <tr>
      <td>{row.rank}</td>
      <td>{profile?.name}</td>
      {tasks.map(task => (
        <React.Fragment key={task}>
          <td>{formatResult(row.results[task]?.result, task)}</td>
          <td>{row.results[task]?.points?.toFixed(1)}</td>
        </React.Fragment>
      ))}
    </tr>
  )
}

export default StandingRow
