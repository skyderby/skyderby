class AddWingsuitToTracks < ActiveRecord::Migration
  def change
    add_reference :tracks, :wingsuit
  end
end
