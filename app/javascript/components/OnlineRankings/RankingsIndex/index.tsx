import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useOnlineRankingsQuery,
  groupQueryKey,
  OnlineRankingGroup
} from 'api/onlineRankings'
import { useI18n } from 'components/TranslationsProvider'
import List from './List'
import styles from './styles.module.scss'
import { OnlineRanking } from 'api/onlineRankings/common'

type OnlineRankingWithGroup = OnlineRanking & {
  group: OnlineRankingGroup
}

const RankingsIndex = () => {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const { data: items } = useOnlineRankingsQuery<OnlineRankingWithGroup[]>({
    select: data =>
      data
        .map(item => ({
          ...item,
          group: queryClient.getQueryData(groupQueryKey(item.groupId))
        }))
        .filter((item): item is OnlineRankingWithGroup => Boolean(item.group))
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('application.header.online_competitions')}</h1>
      </div>

      <List items={items} />
    </div>
  )
}

export default RankingsIndex
