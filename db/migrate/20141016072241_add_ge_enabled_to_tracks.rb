class AddGeEnabledToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :ge_enabled, :boolean
  end
end
