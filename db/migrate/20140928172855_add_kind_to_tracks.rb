class AddKindToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :kind, :integer, default: 0
  end
end
