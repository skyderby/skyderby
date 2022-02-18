class RenameCompetitionSeries < ActiveRecord::Migration[6.0]
  def change
    rename_table :competition_series, :performance_competition_series
    rename_index :performance_competition_series_rounds,
                 :index_competition_series_rounds_on_competition_series_id,
                 :index_rounds_on_performance_competition_series_id
    rename_table :competition_series_rounds, :performance_competition_series_rounds
    rename_table :competition_series_included_competitions,
                 :performance_competition_series_included_competitions
    rename_column :performance_competition_series_rounds,
                  :competition_series_id,
                  :performance_competition_series_id
    rename_column :performance_competition_series_included_competitions,
                  :competition_series_id, :performance_competition_series_id

    update_view :event_lists, version: 8, revert_to_version: 7
  end
end
