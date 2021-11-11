import React, { useState } from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import CategoryForm from 'components/CategoryForm'
import {
  useChangePositionMutation,
  useDeleteCategoryMutation,
  useEditCategoryMutation
} from 'api/performanceCompetitions'
import PencilIcon from 'icons/pencil'
import ChevronUpIcon from 'icons/chevron-up'
import ChevronDownIcon from 'icons/chevron-down'
import TimesIcon from 'icons/times'
import styles from './styles.module.scss'

const Category = ({ event, category, colSpan }) => {
  const [categoryFormShown, setCategoryFormShown] = useState(false)
  const editMutation = useEditCategoryMutation(event.id, {
    onSuccess: () => setCategoryFormShown(false)
  })
  const deleteMutation = useDeleteCategoryMutation()
  const positionMutation = useChangePositionMutation()

  const handleDelete = () => deleteMutation.mutate({ eventId: event.id, id: category.id })
  const moveUp = () =>
    positionMutation.mutate({ eventId: event.id, id: category.id, direction: 'up' })
  const moveDown = () =>
    positionMutation.mutate({ eventId: event.id, id: category.id, direction: 'down' })

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

Category.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    position: PropTypes.number.isRequired
  }).isRequired,
  colSpan: PropTypes.number.isRequired,
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired
}

export default Category
