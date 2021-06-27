import React from 'react'
import PropTypes from 'prop-types'

import { colorByIndex } from 'utils/colors'
import Group from './Group'
import CompetitorResult from './CompetitorResult'
import styles from './styles.module.scss'

const CompetitorsList = ({
  groups,
  selectedCompetitors,
  selectGroup,
  toggleCompetitor
}) => {
  return (
    <aside className={styles.container}>
      {groups.map(group => (
        <Group
          key={group.name}
          name={group.name}
          selectable={group.selectable}
          onToggle={() => selectGroup(group)}
        >
          {group.competitors.map((competitor, idx) => (
            <CompetitorResult
              key={competitor.id}
              competitor={competitor}
              checked={selectedCompetitors.includes(competitor.id)}
              color={colorByIndex(idx)}
              onToggle={toggleCompetitor}
            />
          ))}
        </Group>
      ))}
    </aside>
  )
}

CompetitorsList.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      selectable: PropTypes.bool.isRequired,
      competitors: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number.isRequired }))
    })
  ),
  selectedCompetitors: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectGroup: PropTypes.func.isRequired,
  toggleCompetitor: PropTypes.func.isRequired
}

export default CompetitorsList
