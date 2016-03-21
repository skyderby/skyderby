class AddResultNetToEventTrack < ActiveRecord::Migration
  def change
    add_column :event_tracks, :result_net, :decimal, precision: 10, scale: 2
    change_column :event_tracks, :result, :decimal, precision: 10, scale: 2
  end
end
