class AddStateToTracks < ActiveRecord::Migration[5.1]
  def change
    add_column :tracks, :require_range_review, :boolean, null: false, default: false
  end
end
