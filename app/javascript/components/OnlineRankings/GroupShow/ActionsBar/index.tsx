import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import cx from 'clsx'
import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'
import { OnlineRanking } from 'api/onlineRankings'

type Props = {
  tasks: OnlineRanking['discipline'][]
  selectedTask: string | null
  windCancellation: boolean
}

const ActionsBar = ({ tasks, selectedTask, windCancellation }: Props) => {
  const { t } = useI18n()
  const location = useLocation()

  const buildUrl = (task: string, windCancellation: boolean) => {
    const urlParams = new URLSearchParams()
    if (task) {
      urlParams.set('task', task)
    }

    if (!windCancellation) urlParams.set('windCancellation', 'false')

    return [location.pathname, urlParams.toString()].filter(Boolean).join('?')
  }

  return (
    <div className={styles.container}>
      <Link
        to={buildUrl('', windCancellation)}
        className={cx(styles.button, !selectedTask && 'active')}
      >
        Cumulative scoreboard
      </Link>
      {tasks.map(task => (
        <Link
          key={task}
          to={buildUrl(task, windCancellation)}
          className={cx(styles.button, task === selectedTask && 'active')}
        >
          {t(`disciplines.${task}`)}
        </Link>
      ))}
      <Link
        to={buildUrl(selectedTask || '', !windCancellation)}
        className={cx(styles.button, styles.right)}
      >
        Wind Cancellation:&nbsp;
        {windCancellation ? <span>ON</span> : <span>OFF</span>}
      </Link>
    </div>
  )
}

export default ActionsBar
