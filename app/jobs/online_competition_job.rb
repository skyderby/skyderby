class OnlineCompetitionJob < ApplicationJob
  def perform(track_id)
    track = Track.find_by_id(track_id)
    return unless track

    OnlineCompetitionsService.new(track).execute
  end
end
