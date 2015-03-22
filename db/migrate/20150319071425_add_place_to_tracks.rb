class AddPlaceToTracks < ActiveRecord::Migration
  def change
    add_reference :tracks, :place
  end
end
