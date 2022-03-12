import React, { useState } from 'react'
import cx from 'clsx'

import CategoryForm from 'components/CategoryForm'
import {
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useUpdatePositionMutation,
  Category as CategoryRecord,
  PerformanceCompetition
} from 'api/performanceCompetitions'
import PencilIcon from 'icons/pencil'
import ChevronUpIcon from 'icons/chevron-up'
import ChevronDownIcon from 'icons/chevron-down'
import TimesIcon from 'icons/times'
import styles from './styles.module.scss'

type CategoryProps = {
  event: PerformanceCompetition
  category: CategoryRecord
  colSpan: number
}

const Category = ({ event, category, colSpan }: CategoryProps): JSX.Element => {
  const [categoryFormShown, setCategoryFormShown] = useState(false)
  const editMutation = useUpdateCategoryMutation(event.id, category.id)

  const deleteMutation = useDeleteCategoryMutation(event.id, category.id)
  const positionMutation = useUpdatePositionMutation(event.id, category.id)

  const handleDelete = () => deleteMutation.mutate({ eventId: event.id, id: category.id })
  const moveUp = () => positionMutation.mutate('up')
  const moveDown = () => positionMutation.mutate('down')

  return (
    <tr>
      <td colSpan={colSpan} className={styles.categoryCell}>
        <span>{category.name}</span>

        {event.permissions.canEdit && (
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={() => setCategoryFormShown(true)}
            >
              <PencilIcon />
            </button>
            <button className={styles.actionButton} onClick={handleDelete}>
              <TimesIcon />
            </button>
            <button
              className={cx(styles.actionButton, styles.positionButton)}
              onClick={moveUp}
            >
              <ChevronUpIcon />
            </button>
            <button
              className={cx(styles.actionButton, styles.positionButton)}
              onClick={moveDown}
            >
              <ChevronDownIcon />
            </button>

            {categoryFormShown && (
              <CategoryForm
                onHide={() => setCategoryFormShown(false)}
                mutation={editMutation}
                initialValues={category}
              />
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

export default Category
