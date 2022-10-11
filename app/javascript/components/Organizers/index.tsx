import React from 'react'

import styles from './styles.module.scss'
import { useOrganizersQuery } from 'api/organizers'
import Organizer from './Organizer'

type OrganizersProps = {
  eventType: 'speedSkydiving'
  eventId: number
  editable: boolean
}

const Organizers = ({ eventType, eventId, editable }: OrganizersProps) => {
  const { data: organizers = [] } = useOrganizersQuery(eventType, eventId)

  return (
    <div>
      <h2 className={styles.title}>Judges</h2>
      <div className={styles.list}>
        {organizers.map(organizer => (
          <Organizer key={organizer.id} organizer={organizer} editable={editable} />
        ))}
      </div>
    </div>
  )
}

export default Organizers
