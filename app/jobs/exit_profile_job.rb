class ExitProfileJob < ApplicationJob
  def perform(track_id)
    track = Track.find_by(id: track_id)
    return unless track

    Track::ExitProfile.recalculate(track)
  end
end
