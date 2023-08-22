import React, { useRef, useState } from 'react'
import { UseMutationResult } from 'react-query'
import { AxiosError } from 'axios'

import { EventStatus, eventStatuses } from 'api/events'
import { useI18n } from 'components/TranslationsProvider'
import Dropdown from 'components/Dropdown'
import ChevronDownIcon from 'icons/chevron-down.svg'
import useClickOutside from 'hooks/useClickOutside'

type StatusMenuProps = {
  currentStatus: EventStatus
  className: string
  mutation: UseMutationResult<
    unknown,
    AxiosError<Record<string, string[]>>,
    Partial<{ status: EventStatus }>
  >
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

const StatusMenu = ({
  currentStatus,
  className,
  mutation
}: StatusMenuProps): JSX.Element => {
  const { t } = useI18n()
  const [showStatuses, setShowStatuses] = useState(false)

  const changeStatusButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside([menuRef, changeStatusButtonRef], () => setShowStatuses(false))

  const toggleStatusesDropdown = () => setShowStatuses(open => !open)

  const setEventStatus = (status: EventStatus) => {
    mutation.mutate(
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
      className={className}
      ref={changeStatusButtonRef}
      onClick={toggleStatusesDropdown}
    >
      {t('activerecord.attributes.event.status')}: {t(`event_status.${currentStatus}`)}
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
              active={currentStatus === status}
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
