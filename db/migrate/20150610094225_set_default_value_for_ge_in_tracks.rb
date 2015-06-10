class SetDefaultValueForGeInTracks < ActiveRecord::Migration
  def change
    change_column :tracks, :ge_enabled, :boolean, default: true
  end
end
