import React from 'react'
import { OnlineRanking, StandingsRow } from 'api/onlineRankings'
import styles from './styles.module.scss'
import ProfileName from 'components/ProfileName'
import { useI18n } from 'components/TranslationsProvider'
import PlaceLabel from 'components/PlaceLabel'
import SuitLabel from 'components/SuitLabel'
import formatResult from 'utils/formatResult'

type Props = {
  onlineRanking: OnlineRanking
  standings: StandingsRow[]
}

const Scoreboard = ({ onlineRanking, standings }: Props) => {
  const { t } = useI18n()
  const worldwide = onlineRanking.placeId === null

  return (
    <div className={styles.scoreboardContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.scoreboardTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>{t('activerecord.attributes.track.name')}</th>
              <th>{t('activerecord.attributes.track.suit')}</th>
              {worldwide && <th>{t('activerecord.attributes.track.place')}</th>}
              <th>{t('virtual_competitions.scoreboard.result')}</th>
              {onlineRanking.displayHighestSpeed && <th>Best speed</th>}
              {onlineRanking.displayHighestGr && <th>Best GR</th>}
              <th>{t('activerecord.attributes.track.recorded_at')}</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(row => (
              <tr key={row.rank}>
                <td>{row.rank}</td>
                <td>
                  <ProfileName id={row.profileId} />
                </td>
                <td>
                  <SuitLabel suitId={row.suitId} />
                </td>
                {worldwide && (
                  <td>
                    <PlaceLabel
                      placeId={row.placeId}
                      fallbackName={row.userProvidedPlaceName}
                    />
                  </td>
                )}
                <td className={styles.alignRight}>
                  {formatResult(row.result, onlineRanking.discipline)}
                </td>
                {onlineRanking.displayHighestSpeed && (
                  <td className={styles.alignRight}>{row.highestSpeed.toFixed()}</td>
                )}
                {onlineRanking.displayHighestGr && (
                  <td className={styles.alignRight}>
                    {row.highestGr > 10 ? '> 10' : row.highestGr.toFixed(1)}
                  </td>
                )}
                <td className={styles.alignRight}>
                  {row.recordedAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Scoreboard
