import React from 'react'
import { OnlineRanking } from 'api/onlineRankings/common'
import { OnlineRankingGroup } from 'api/onlineRankings'

type ListProps = {
  items: (OnlineRanking & { group: OnlineRankingGroup })[]
}

const List = (props: ListProps) => {
  return (
    <>
      <h2>Featured</h2>
      <ul></ul>

      <h2>All</h2>
      <ul>
        {props.items.map(ranking => (
          <li key={ranking.id}>
            {ranking.group.name} - {ranking.name}
          </li>
        ))}
      </ul>
    </>
  )
}

export default List
