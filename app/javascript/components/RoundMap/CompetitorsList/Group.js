import React from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { selectGroup } from 'redux/events/round'
import { useI18n } from 'components/TranslationsProvider'
import CompetitorResult from './CompetitorResult'

import styles from './styles.module.scss'

const Group = ({ resultIds, number }) => {
  const { t } = useI18n()
  const dispatch = useDispatch()

  const handleSelect = () => dispatch(selectGroup(resultIds))

  return (
    <div className={styles.group}>
      <div className={styles.header}>
        <span>{`${t('events.rounds.map.group')} ${number}`}</span>
        <button className={styles.flatButton} onClick={handleSelect}>
          Select
        </button>
      </div>
      <div className={styles.list}>
        {resultIds.map((resultId, idx) => (
          <CompetitorResult resultId={resultId} key={idx} />
        ))}
      </div>
    </div>
  )
}

Group.propTypes = {
  resultIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  number: PropTypes.number.isRequired
}

export default Group
