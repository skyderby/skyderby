class RemoveFfRangeFromTracks < ActiveRecord::Migration[8.1]
  def change
    change_table :tracks, bulk: true do |t|
      t.remove_index %i[id ff_start ff_end], name: 'index_tracks_on_id_and_ff_start_and_ff_end'
      t.remove :ff_start, :ff_end, type: :integer
    end
  end
end
