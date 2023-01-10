import React from 'react'
import { Link } from 'react-router-dom'
import { OnlineRanking, OnlineRankingGroup } from 'api/onlineRankings'

type OnlineRankingWithGroup = OnlineRanking & { group: OnlineRankingGroup }

type ListProps = {
  items: OnlineRankingWithGroup[]
}

const groupRankings = (
  map: Map<OnlineRankingGroup, OnlineRankingWithGroup[]>,
  item: OnlineRankingWithGroup
) => {
  if (map.has(item.group)) {
    const group = map.get(item.group)
    if (Array.isArray(group)) group.push(item)
  } else {
    map.set(item.group, [item])
  }

  return map
}

const List = ({ items }: ListProps) => {
  const featured = items
    .filter(item => item.featured || item.group.featured)
    .reduce(groupRankings, new Map<OnlineRankingGroup, OnlineRankingWithGroup[]>())

  const groupedRankings = items
    .filter(item => !item.featured && !item.group.featured)
    .reduce(groupRankings, new Map<OnlineRankingGroup, OnlineRankingWithGroup[]>())

  return (
    <>
      <h2>Featured</h2>
      <ul>
        {Array.from(featured).map(([group, rankings]) => (
          <React.Fragment key={group.id}>
            {group.cumulative ? (
              <li key={group.id}>
                <Link to={`/online_rankings/groups/${group.id}`}>
                  {group.name}.
                  <br />
                  Cumulative scoreboard from {rankings.length} competitions
                </Link>
              </li>
            ) : (
              <>
                {rankings.map(ranking => (
                  <li key={ranking.id}>
                    <Link to={`/online_rankings/${ranking.id}`}>{ranking.name}</Link>
                  </li>
                ))}
              </>
            )}
          </React.Fragment>
        ))}
      </ul>

      <h2>All</h2>
      {Array.from(groupedRankings).map(([group, rankings]) => (
        <div key={group.id}>
          <h3>{group.name}</h3>
          <ul>
            {rankings.map(ranking => (
              <li key={ranking.id}>
                <Link to={`/online_rankings/${ranking.id}`}>{ranking.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

export default List
