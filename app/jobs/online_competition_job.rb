class OnlineCompetitionJob < ApplicationJob
  def perform(track_id)
    @track = Track.find_by(id: track_id)
    return unless @track

    calculate_results
    send_verify_mail
  end

  def calculate_results
    OnlineCompetitionsService.score_track(@track)
  end

  def send_verify_mail
    top_scores = VirtualCompetition::PersonalTopScore.where(track: @track).where('rank <= 3')
    return if top_scores.blank?

    AdminMailer.verify_online_competition_result(@track).deliver_later
  end
end
