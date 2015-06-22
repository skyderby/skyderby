class LastViewedUpdateWorker
  include Sidekiq::Worker

  def perform(track_id)
    track = Track.find_by_id(track_id)
    return unless track

    track.update_columns(lastviewed_at: Time.zone.now)
  end
end
