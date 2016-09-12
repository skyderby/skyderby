class ResultsWorker
  include Sidekiq::Worker

  def perform(track_id)
    track = Track.find_by_id(track_id)
    return unless track

    TrackResultsService.new(track).execute
  end
end
