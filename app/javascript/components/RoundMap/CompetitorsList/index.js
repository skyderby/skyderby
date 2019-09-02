import { h } from 'preact'

import Group from './Group'

const CompetitorsList = ({ groups = [] }) => {
  return (
    <div>
      {groups.map((group, idx) => (
        <Group competitors={group} key={idx} number={idx + 1} />
      ))}
    </div>
  )
}

export default CompetitorsList
