class OnlineCompetitionJob < ApplicationJob
  def perform(track_id)
    @track = Track.find_by(id: track_id)
    return unless @track

    Track::SensorSample.import(@track)
    calculate_results
    send_verify_mail
  end

  def calculate_results
    OnlineCompetitionsService.score_track(@track)
  end

  def send_verify_mail
    AdminMailer.verify_online_competition_result(@track).deliver_later
  end
end
