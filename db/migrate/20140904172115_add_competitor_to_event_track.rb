class AddCompetitorToEventTrack < ActiveRecord::Migration
  def change
    add_reference :event_tracks, :competitor
  end
end
