import React from 'react'
import { OnlineRanking } from 'api/onlineRankings'
import { GroupStandingsRow } from 'api/onlineRankings/groups'
import ProfileName from 'components/ProfileName'

const formatResult = (result: number | undefined, task: OnlineRanking['discipline']) => {
  if (!result) return

  return result.toFixed(task === 'distance' ? 0 : 1)
}

type Props = {
  row: GroupStandingsRow
  tasks: OnlineRanking['discipline'][]
}

const StandingRow = ({ row, tasks }: Props) => {
  return (
    <tr>
      <td>{row.rank}</td>
      <td>
        <ProfileName id={row.profileId} />
      </td>
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
