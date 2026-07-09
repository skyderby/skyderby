class AddActivityTimestampsToTracks < ActiveRecord::Migration[8.1]
  def change
    change_table :tracks, bulk: true do |t|
      t.timestamptz :exited_at
      t.timestamptz :deployed_at
      t.timestamptz :landed_at
    end
  end
end
