import React from 'react'
import NiceModal from '@ebay/nice-modal-react'
import {
  Tournament,
  useCreateCompetitorMutation,
  useUpdateCompetitorMutation,
  useDeleteCompetitorMutation
} from 'api/tournaments'
import PlusIcon from 'icons/plus.svg'
import { SuitName } from 'components/SuitLabel'
import { ProfileName } from 'components/ProfileLabel'
import ActionsBar from 'components/ActionsBar'
import Form from './Form'
import styles from './styles.module.scss'

type Props = {
  tournament: Tournament
}

const Competitors = ({ tournament }: Props) => {
  const createMutation = useCreateCompetitorMutation(tournament.id)
  const updateMutation = useUpdateCompetitorMutation(tournament.id)
  const deleteMutation = useDeleteCompetitorMutation(tournament.id)

  const deleteCompetitor = (competitorId: number) => {
    if (confirm('Are you sure you want to delete this competitor?')) {
      deleteMutation.mutate(competitorId)
    }
  }

  return (
    <>
      <ActionsBar>
        <ActionsBar.Button
          onClick={() => NiceModal.show(Form, { mutation: createMutation })}
        >
          <PlusIcon /> &nbsp; Competitor
        </ActionsBar.Button>
      </ActionsBar>

      <div className={styles.container}>
        <div className={styles.table}>
          <div className={styles.headerRow}>
            <div className={styles.cell}>Name</div>
            <div className={styles.cell}>Suit</div>
            {tournament.permissions.canEdit && <div className={styles.cell} />}
          </div>

          {tournament.competitors.map(competitor => (
            <div key={competitor.id} className={styles.row}>
              <div className={styles.cell}>
                <ProfileName withPhoto profile={competitor.profile} />
              </div>

              <div className={styles.cell}>
                <SuitName
                  name={competitor.suit.name}
                  code={competitor.suit.manufacturer?.code}
                />
              </div>

              {tournament.permissions.canEdit && (
                <div className={styles.cell}>
                  <button
                    className={styles.button}
                    onClick={() =>
                      NiceModal.show(Form, {
                        mutation: updateMutation,
                        competitorId: competitor.id,
                        initialValues: competitor
                      })
                    }
                  >
                    Edit
                  </button>
                  <button
                    className={styles.button}
                    onClick={() => deleteCompetitor(competitor.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Competitors
