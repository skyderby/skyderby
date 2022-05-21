class AddWindCancelledToVirtualCompetitionResults < ActiveRecord::Migration[6.0]
  def change
    add_column :virtual_competition_results, :wind_cancelled, :boolean, null: false, default: false
    remove_index :virtual_competition_results, column: [:virtual_competition_id, :track_id]
    add_index :virtual_competition_results,
              [:virtual_competition_id, :track_id, :wind_cancelled],
              unique: true,
              name: :index_results_on_competition_track_wind_cancelled
  end
end
