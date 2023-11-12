import React, { useRef, useState } from 'react'
import { TrackActivity } from 'api/tracks'
import { useI18n } from 'components/TranslationsProvider'
import Dropdown from 'components/Dropdown'
import ChevronDownIcon from 'icons/chevron-down.svg'
import styles from './styles.module.scss'
import type { Task } from './tasks'

type Props = {
  activity: TrackActivity
  task: Task
  onChange: (activity: TrackActivity, task: Task) => void
}

const tasksByActivity = [
  {
    activity: 'skydive' as const,
    tasks: ['distance', 'speed', 'time', 'flare'] as const
  },
  {
    activity: 'base' as const,
    tasks: ['distance_in_time', 'distance_in_altitude', 'flare'] as const
  },
  { activity: 'speed_skydiving' as const, tasks: ['vertical_speed'] as const }
]

const TaskMenu = ({ task: selectedTask, onChange }: Props) => {
  const { t } = useI18n()
  const [showTasks, setShowTasks] = useState(false)
  const changeTaskButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleTasksDropdown = () => setShowTasks(open => !open)

  return (
    <button
      className={styles.button}
      ref={changeTaskButtonRef}
      onClick={toggleTasksDropdown}
    >
      Task: {t(`disciplines.${selectedTask}`)} &nbsp;
      <ChevronDownIcon />
      {showTasks && (
        <Dropdown
          ref={menuRef}
          referenceElement={changeTaskButtonRef.current}
          options={{
            placement: 'bottom-start',
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
          }}
        >
          {tasksByActivity.map(({ activity, tasks }) => (
            <React.Fragment key={activity}>
              <div>{activity}</div>
              {tasks.map(task => (
                <Dropdown.Button
                  key={task}
                  active={selectedTask === task}
                  className={styles.actionButton}
                  onClick={() => onChange(activity, task)}
                >
                  {t(`disciplines.${task}`)}
                </Dropdown.Button>
              ))}
            </React.Fragment>
          ))}
        </Dropdown>
      )}
    </button>
  )
}

export default TaskMenu
