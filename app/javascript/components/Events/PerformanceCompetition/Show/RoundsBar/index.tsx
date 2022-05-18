import React from 'react'
import { NavLink } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import { Round } from 'api/performanceCompetitions'
import styles from './styles.module.scss'

type RoundsBarProps = {
  link: (roundId: number) => string
  rounds: Round[]
}

const RoundsBar = ({ link, rounds }: RoundsBarProps) => {
  const { t } = useI18n()

  return (
    <div className={styles.container}>
      {rounds.map(round => (
        <NavLink key={round.id} to={link(round.id)} className={styles.button}>
          {t(`disciplines.${round.task}`)} - {round.number}
        </NavLink>
      ))}
    </div>
  )
}

export default RoundsBar
