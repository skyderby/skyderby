class AddVisibilityAndParticipantsToVirtualCompetitions < ActiveRecord::Migration[8.1]
  def change
    add_column :virtual_competitions, :visibility, :integer, null: false, default: 0

    create_table :virtual_competition_participants do |t|
      t.references :virtual_competition, null: false, foreign_key: true, type: :integer, index: false
      t.references :profile, null: false, foreign_key: true, type: :integer
      t.boolean :admin, null: false, default: false
      t.datetime :tracks_scanned_at
      t.timestamps
    end

    add_index :virtual_competition_participants, %i[virtual_competition_id profile_id],
              unique: true, name: 'index_vc_participants_on_competition_and_profile'

    create_table :virtual_competition_disciplines do |t|
      t.references :virtual_competition, null: false, foreign_key: true, type: :integer,
                                         index: { name: 'index_vc_disciplines_on_competition' }
      t.integer :discipline, null: false
      t.integer :parameter, null: false, default: 0
      t.integer :position, null: false, default: 0
      t.timestamps
    end

    add_reference :virtual_competition_results, :discipline,
                  foreign_key: { to_table: :virtual_competition_disciplines }, index: false

    remove_index :virtual_competition_results, %i[virtual_competition_id track_id wind_cancelled],
                 unique: true, name: 'index_results_on_competition_track_wind_cancelled'
    add_index :virtual_competition_results, %i[virtual_competition_id track_id discipline_id wind_cancelled],
              unique: true, nulls_not_distinct: true, name: 'index_results_on_competition_track_discipline'
  end
end
