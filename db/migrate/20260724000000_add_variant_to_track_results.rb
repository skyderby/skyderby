class AddVariantToTrackResults < ActiveRecord::Migration[8.1]
  def up
    add_column :track_results, :variant, :string

    execute <<~SQL.squish
      UPDATE track_results SET variant = 'best' WHERE variant IS NULL
    SQL

    change_column_null :track_results, :variant, false

    remove_index :track_results,
                 column: %i[track_id discipline],
                 name: :index_track_results_on_track_id_and_discipline

    add_index :track_results,
              %i[track_id discipline variant],
              unique: true,
              name: :index_track_results_on_track_id_and_discipline_and_variant
  end

  def down
    remove_index :track_results,
                 name: :index_track_results_on_track_id_and_discipline_and_variant

    execute <<~SQL.squish
      DELETE FROM track_results WHERE variant <> 'best'
    SQL

    add_index :track_results,
              %i[track_id discipline],
              unique: true,
              name: :index_track_results_on_track_id_and_discipline

    remove_column :track_results, :variant
  end
end
