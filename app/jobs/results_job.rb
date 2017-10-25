class ResultsJob < ApplicationJob
  def perform(track_id)
    track = Track.find_by(id: track_id)
    return unless track

    TrackResultsService.new(track).execute
  rescue WindowRangeFinder::ValueOutOfRange => ex
    Rails.logger.info("Failed to calc best results beacause of error #{ex}")
  end
end
