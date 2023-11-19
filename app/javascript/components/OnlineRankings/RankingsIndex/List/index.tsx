import React from 'react'
import { Link } from 'react-router-dom'
import { OnlineRanking, OnlineRankingGroup } from 'api/onlineRankings'
import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

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
  const { t } = useI18n()
  const featured = items
    .filter(item => item.featured || item.group.featured)
    .reduce(groupRankings, new Map<OnlineRankingGroup, OnlineRankingWithGroup[]>())

  const groupedRankings = items
    .filter(item => !item.featured && !item.group.featured)
    .reduce(groupRankings, new Map<OnlineRankingGroup, OnlineRankingWithGroup[]>())

  return (
    <>
      <div className={styles.group}>
        {Array.from(featured).map(([group, rankings]) => (
          <React.Fragment key={`group-${group.id}`}>
            {group.cumulative ? (
              <Link to={`/online_rankings/groups/${group.id}`} className={styles.card}>
                <div className={styles.title}>⭐&nbsp;{group.name}</div>
                <div className={styles.description}>
                  Cumulative scoreboard from {rankings.length} competitions
                </div>
              </Link>
            ) : (
              <>
                {rankings.map(ranking => (
                  <Link
                    to={`/online_rankings/${ranking.id}`}
                    className={styles.card}
                    key={ranking.id}
                  >
                    <div className={styles.title}>⭐&nbsp;{ranking.name}</div>
                    <div className={styles.description}>
                      {t(`virtual_competitions.tasks.${ranking.discipline}`, {
                        parameter: ranking.disciplineParameter
                      })}
                    </div>
                  </Link>
                ))}
              </>
            )}
          </React.Fragment>
        ))}
      </div>

      {Array.from(groupedRankings).map(([group, rankings]) => (
        <React.Fragment key={group.id}>
          <h3>{group.name}</h3>
          <div key={group.id} className={styles.group}>
            {rankings.map(ranking => (
              <Link
                to={`/online_rankings/${ranking.id}`}
                className={styles.card}
                key={ranking.id}
              >
                <div className={styles.title}>{ranking.name}</div>
                <div className={styles.description}>
                  {t(`virtual_competitions.tasks.${ranking.discipline}`, {
                    parameter: ranking.disciplineParameter
                  })}
                </div>
              </Link>
            ))}
          </div>
        </React.Fragment>
      ))}
    </>
  )
}

export default List
