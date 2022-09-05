import React, { useRef, useState } from 'react'
import cx from 'clsx'

import { eventStatuses } from 'api/events'
import Dropdown from 'components/Dropdown'
import ChevronDownIcon from 'icons/chevron-down.svg'
import { useEditSpeedSkydivingCompetitionMutation } from 'api/speedSkydivingCompetitions'
import { useI18n } from 'components/TranslationsProvider'
import useClickOutside from 'hooks/useClickOutside'
import { SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions/types'
import styles from './styles.module.scss'

type StatusMenuProps = {
  event: SpeedSkydivingCompetition
}

function fireConfetti() {
  import('canvas-confetti').then(({ default: confetti }) => {
    confetti({
      particleCount: 300,
      angle: 90,
      spread: 135,
      startVelocity: 65,
      ticks: 200,
      origin: {
        y: 1.25
      }
    })
  })
}

const StatusMenu = ({ event }: StatusMenuProps): JSX.Element => {
  const { t } = useI18n()
  const [showStatuses, setShowStatuses] = useState(false)
  const editEventMutation = useEditSpeedSkydivingCompetitionMutation(event.id)

  const changeStatusButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside([menuRef, changeStatusButtonRef], () => setShowStatuses(false))

  const toggleStatusesDropdown = () => setShowStatuses(open => !open)

  const setEventStatus = (status: SpeedSkydivingCompetition['status']) => {
    editEventMutation.mutate(
      { status },
      {
        onSuccess: () => {
          if (status === 'finished') fireConfetti()
        }
      }
    )
  }

  return (
    <button
      className={cx(styles.button, styles.buttonRight)}
      ref={changeStatusButtonRef}
      onClick={toggleStatusesDropdown}
    >
      {t('activerecord.attributes.event.status')}: {t(`event_status.${event.status}`)}
      &nbsp;
      <ChevronDownIcon />
      {showStatuses && (
        <Dropdown
          ref={menuRef}
          referenceElement={changeStatusButtonRef.current}
          options={{
            placement: 'bottom-end',
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
          }}
        >
          {eventStatuses.map(status => (
            <Dropdown.Button
              key={status}
              active={event.status === status}
              className={styles.actionButton}
              onClick={() => setEventStatus(status)}
            >
              {t(`event_status.${status}`)}
            </Dropdown.Button>
          ))}
        </Dropdown>
      )}
    </button>
  )
}

export default StatusMenu
