class LastViewedUpdateWorker
  include Sidekiq::Worker

  def perform(track_id)
    Track.find(track_id).update_columns(lastviewed_at: Time.zone.now)
  end
end
