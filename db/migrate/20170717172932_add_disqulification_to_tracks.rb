class AddDisqulificationToTracks < ActiveRecord::Migration[5.1]
  def change
    add_column :tracks, :disqualified_from_online_competitions, :boolean, default: false, null: false
  end
end
