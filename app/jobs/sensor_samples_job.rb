class SensorSamplesJob < ApplicationJob
  def perform(track_id)
    track = Track.find_by(id: track_id)
    return unless track

    Track::SensorSample.import(track)
    OnlineCompetitionJob.perform_later(track.id)
  end
end
