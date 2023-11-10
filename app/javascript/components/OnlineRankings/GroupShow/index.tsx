import React from 'react'
import { useParams } from 'react-router-dom'
import { useGroupQuery, useGroupStandingsQuery } from 'api/onlineRankings/groups'
import Loading from 'components/LoadingSpinner'
import ErrorPage from 'components/ErrorPage'
import styles from './styles.module.scss'

const GroupShow = () => {
  const params = useParams()
  const id = Number(params.groupId)
  const { data: group, isLoading: isGroupLoading } = useGroupQuery(id)
  const {
    data: standings,
    isLoading: isScoresLoading,
    isError,
    error
  } = useGroupStandingsQuery(id)

  if (isScoresLoading || isGroupLoading) return <Loading />
  if (isError) return ErrorPage.forError(error, { linkBack: '/online_rankings' })
  if (!group || !standings) return null

  return (
    <div>
      <h2>{group?.name}</h2>
      <table className={styles.scoreboardTable}>
        <thead>
          <tr></tr>
        </thead>
        {standings.map(categoryStandings => (
          <tbody key={categoryStandings.category}>
            <tr>{categoryStandings.category}</tr>
            {categoryStandings.rows.map(row => (
              <tr key={row.rank}>
                <td>{row.rank}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}

export default GroupShow
